import { StageChannel, VoiceChannel, Client, Message } from 'discord.js';
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  NoSubscriberBehavior,
  PlayerSubscription,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
import axios from 'axios';
import { connectToChannel } from '../helpers/connectToChannel';
import { playingEmbed } from './embeds/playingEmbed';
import { PlayerQueue } from './PlayerQueue';
import { QueueItem } from './interfaces/QueueItem';

export const connections: { [key: string]: MusicPlayer } = {};

export class MusicPlayer extends PlayerQueue {
  private conn: VoiceConnection | null;

  private player: AudioPlayer;

  private subscription: PlayerSubscription | undefined;

  private channel: VoiceChannel | StageChannel;

  private message: Message;

  private client: Client<boolean>;

  private retryAttempts: number;

  constructor(client: Client, message: Message) {
    super();
    this.client = client;
    this.message = message;
    this.channel = message.member?.voice.channel as VoiceChannel | StageChannel;
    this.conn = connectToChannel(this.channel);
    this.player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      },
    });
    this.subscription = this.conn.subscribe(this.player);
    this.retryAttempts = 0;

    this.conn.on(VoiceConnectionStatus.Disconnected, async () => {
      // This is to check if the bot was really disconnected or changed channels / changed region
      try {
        if (this.conn !== null) {
          await Promise.race([
            entersState(this.conn, VoiceConnectionStatus.Signalling, 5_000),
            entersState(this.conn, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        }
      } catch (error) {
        this.queue = [];
        await this.stop(this.message);
      }
    });

    this.conn.on(VoiceConnectionStatus.Ready, async () => {
      // This will start the player again if it loses connection
      if (this.currentlyPlaying !== null) {
        this.queue.unshift(this.currentlyPlaying);
        await this.playAudio();
      }
    });

    this.player.on(AudioPlayerStatus.Idle, async () => {
      try {
        if (this.channel.members.size === 1) await this.stop(this.message);
        if (
          this.queue[0] &&
          this.isPlayerNotBusy() &&
          this.conn?.state.status === 'ready'
        ) {
          await this.playAudio();
        }
        if (
          !this.queue[0] &&
          this.isPlayerNotBusy() &&
          this.conn?.state.status === 'ready'
        ) {
          await this.stop(this.message);
        }
      } catch (err) {
        console.log('erro no listener');
        console.log(err);
      }
    });
  }

  private playAudio = async (): Promise<null> => {
    try {
      const song = this.getNextSong() as QueueItem;

      const { url } = song;
      console.log(url);
      if (this.conn && this.conn.state.status !== 'ready') {
        await entersState(this.conn, VoiceConnectionStatus.Ready, 5_000);
      }

      const metadata = await ytdl.getInfo(url, {
        requestOptions: {
          headers: {
            cookie: process.env.YOUTUBE_LOGIN_COOKIE,
          },
        },
      });

      try {
        if (this.retryAttempts < 40) {
          const head = await axios.head(metadata.formats[0].url);
          console.log(head.status);
        } else {
          this.message.channel.send(
            'Não consegui tocar essa música, vou ter que pular ela!'
          );
          this.retryAttempts = 0;
          this.playAudio();
        }
      } catch (err: any) {
        console.log(
          err.response.status,
          `Erro ${err.response.status}, tentando novamente.`
        );
        this.queue.unshift(song);
        this.retryAttempts += 1;
        return this.playAudio();
      }

      const stream = ytdl.downloadFromInfo(metadata, {
        filter: 'audioonly',
        quality: 'highestaudio',
        requestOptions: {
          headers: {
            cookie: process.env.YOUTUBE_LOGIN_COOKIE,
          },
        },
      });

      const audioResource = createAudioResource(stream);

      this.player.play(audioResource);
      this.currentlyPlaying = song;
      const embed = playingEmbed(this.message, this.currentlyPlaying);

      // const funcao = stream.listeners('error')[2];
      // stream.removeListener('error', funcao);

      // stream.on('error', (err) => {
      //   try {
      //     throw new Error();
      //   } catch {
      //     stream.destroy();
      //     this.queue.unshift(song);
      //     console.log(err);
      //   }
      // });

      await this.message.channel.send({ embeds: [embed] });
      return null;
    } catch (err) {
      console.log('Erro 1');
      console.log(err);
      await this.message.reply(`Ocorreu um erro ao tentar reproduzir o video!`);
      return null;
    }
  };

  GetPlayerStatus = () => this.player.state.status;

  private isPlayerNotBusy = () =>
    this.GetPlayerStatus() !== AudioPlayerStatus.Playing &&
    this.GetPlayerStatus() !== AudioPlayerStatus.Buffering;

  play = async (message: Message, args: string[]) => {
    this.message = message;
    if (message.member?.voice.channel !== this.channel) {
      const someoneIsListening = this.channel.members.size > 1;
      if (message.member?.voice.channel && !someoneIsListening) {
        this.conn = connectToChannel(message.member?.voice.channel);
      }
      await message.reply(
        `Você precisa estar no mesmo canal que a pessoa que está ouvindo!`
      );
      return null;
    }

    if (this.GetPlayerStatus() === AudioPlayerStatus.Paused) {
      this.player.unpause();
      return null;
    }

    const argsExist = args.join('');

    if (argsExist) {
      if (this.queue.length > 200) {
        await message.reply(
          `Já tem muita música na fila! Não vou adicionar mais, meu caderninho ta cheio!`
        );
        return null;
      }
      await this.addToQueue(this.client, message, args);

      if (this.isPlayerNotBusy() && this.queue[0]) {
        await this.playAudio();
        return null;
      }

      return null;
    }
    return null;
  };

  next = async (message: Message) => {
    this.player.stop();
    await message.channel.send(`Tocando próxima música!`);
    return null;
  };

  stop = async (message: Message) => {
    this.queue = [];
    this.conn?.removeAllListeners();
    this.conn?.destroy();
    this.player.removeAllListeners();
    delete connections[`${message.guildId}`];
    await message.channel.send(`Player foi parado!`);
    return null;
  };

  pause = async (message: Message) => {
    this.player.pause();
    await message.channel.send(`Player foi pausado!`);
    return null;
  };

  remove = async (message: Message, args: string[]) => {
    const index = Number(args[0]);
    if (index > this.queue.length) {
      await message.reply(`Não existe música na posição ${index}`);
      return null;
    }
    const removedSong = this.queue.splice(index - 1, 1);
    await message.reply(
      `Removida a música na posição: ${index}: ${removedSong[0].title}`
    );
    return null;
  };

  loop = async (message: Message) => {
    this.loopState = !this.loopState;
    this.queuePosition = 1;
    if (this.currentlyPlaying && this.loopState) {
      this.queue.unshift(this.currentlyPlaying);
    }
    if (this.loopState) {
      return message.reply(`Loop foi ativado!`);
    }
    return message.reply(`Loop foi desativado!`);
  };
}
