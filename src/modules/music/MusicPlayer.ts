import { StageChannel, VoiceChannel, Message } from 'discord.js';
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  NoSubscriberBehavior,
  PlayerSubscription,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { exec as ytdlexec } from 'youtube-dl-exec';
import { playingEmbed } from './embeds/playingEmbed';
import { PlayerQueue } from './PlayerQueue';
import { QueueItem } from './interfaces/QueueItem';
import Logger from '../../logger/Logger';
import { ICustomClient } from '../../interfaces/customInterfaces';

export const connections: Record<string, MusicPlayer> = {};

const connectToChannel = (channel: VoiceChannel | StageChannel) =>
  joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    // @ts-ignore
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

export class MusicPlayer extends PlayerQueue {
  private conn: VoiceConnection | null;

  private player: AudioPlayer;

  private subscription: PlayerSubscription | undefined;

  private channel: VoiceChannel | StageChannel;

  private message: Message;

  private client: ICustomClient;

  constructor(client: ICustomClient, message: Message) {
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
        await this.internalStop(this.message);
      }
    });

    this.conn.on(VoiceConnectionStatus.Ready, async () => {
      // This will start the player again if it loses connection
      if (this.currentlyPlaying !== null) {
        this.queue.unshift(this.currentlyPlaying);
        await this.playerDecisionMaker();
      }
    });

    this.player.on(AudioPlayerStatus.Idle, async () => {
      await this.playerDecisionMaker();
    });
  }

  /** This method tells the player what it should do:
   * Stop or play the next song. */
  private playerDecisionMaker = async () => {
    try {
      const playerIsReady = () => this.conn?.state.status === 'ready';

      if (this.channel.members.size === 1) return await this.internalStop(this.message);

      if (this.conn && this.conn.state.status !== 'ready') {
        await entersState(this.conn, VoiceConnectionStatus.Ready, 5_000);
      }

      if (this.queue[0] && this.isPlayerNotBusy() && playerIsReady()) {
        return await this.playAudio();
      }

      if (!this.queue[0] && this.isPlayerNotBusy() && playerIsReady()) {
        return await this.internalStop(this.message);
      }

      throw new Error("playerDecisionMaker couldn't determine what to do.");
    } catch (err: any) {
      Logger.log('ERROR', 'Error on player idle listener', err, {
        connStatus: this.conn?.state.status,
        playerStatus: this.GetPlayerStatus(),
        queue: this.queue,
        channelMembers: this.channel.members.size,
      });
      return await this.internalStop(this.message);
    }
  };

  /** **DONT USE IT DIRECTLY** \
   * This method will play the next song in queue, even if the queue is empty. \
   * Use playerDecisionMaker() to play the next song. */
  private playAudio = async () => {
    try {
      const song = this.getNextSong() as QueueItem;

      const { url } = song;

      Logger.log('INFO', `Trying to play ${url}`, new Error());

      const stream = ytdlexec(
        url,
        {
          output: '-',
          format: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
          limitRate: '100K',
          cookies: process.env.YOUTUBE_LOGIN_COOKIE,
          verbose: true,
        },
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );

      const audioResource = createAudioResource(stream.stdout!);

      this.player.play(audioResource);
      this.currentlyPlaying = song;
      const embed = playingEmbed(this.message, this.currentlyPlaying);

      return await this.message.channel.send({ embeds: [embed] });
    } catch (err: any) {
      Logger.log('ERROR', 'There was an error while trying to play the song.', err);
      await this.playerDecisionMaker();
      return await this.message.reply(`Ocorreu um erro ao tentar reproduzir o video!`);
    }
  };

  GetPlayerStatus = () => this.player.state.status;

  private isPlayerNotBusy = () =>
    this.GetPlayerStatus() !== AudioPlayerStatus.Playing &&
    this.GetPlayerStatus() !== AudioPlayerStatus.Buffering;

  play = async (message: Message, args: string[]) => {
    if (message.member?.voice.channel !== this.channel) {
      const someoneIsListening = this.channel.members.size > 1;
      if (message.member?.voice.channel && !someoneIsListening) {
        this.conn = connectToChannel(message.member?.voice.channel);
        this.channel = message.member.voice.channel;
      } else {
        return await message.reply(
          `Você precisa estar no mesmo canal que a pessoa que está ouvindo!`
        );
      }
    }

    this.message = message;
    const argsExist = args.join('');

    // To unpause the player when someone sends no arguments
    if (this.GetPlayerStatus() === AudioPlayerStatus.Paused) {
      this.player.unpause();
    }

    if (!argsExist) return { content: 'No argument' };

    if (this.queue.length > 200) {
      return await message.reply(
        `Já tem muita música na fila! Não vou adicionar mais, meu caderninho ta cheio!`
      );
    }
    try {
      if (this.isPlayerNotBusy() && !this.queue[0]) {
        await this.addToQueue(this.client, message, args);
        return await this.playerDecisionMaker();
      }
      return await this.addToQueue(this.client, message, args);
    } catch (err: any) {
      Logger.log('ERROR', 'Error at play.', err);
      return await this.playerDecisionMaker();
    }
  };

  next = async (message: Message) => {
    if (message.member?.voice.channel !== this.channel) {
      return await message.reply(
        `Você precisa estar no mesmo canal que a pessoa que está ouvindo!`
      );
    }

    this.player.stop();
    return await message.channel.send(`Tocando próxima música!`);
  };

  private internalStop = async (message: Message) => {
    this.queue = [];
    this.conn?.removeAllListeners();
    if (this.conn?.state.status !== VoiceConnectionStatus.Destroyed) {
      this.conn?.destroy();
    }
    this.player.removeAllListeners();
    delete connections[`${message.guildId}`];

    // If the bot is kicked or banned there isn't a channel to send messages rs
    if (!message.channel) {
      return { content: 'Player foi parado!' };
    }
    return await message.channel.send(`Player foi parado!`);
  };

  stop = async (message: Message) => {
    if (message.member?.voice.channel !== this.channel) {
      return await message.reply(
        `Você precisa estar no mesmo canal que a pessoa que está ouvindo!`
      );
    }

    return this.internalStop(message);
  };

  pause = async (message: Message) => {
    if (message.member?.voice.channel !== this.channel) {
      return await message.reply(
        `Você precisa estar no mesmo canal que a pessoa que está ouvindo!`
      );
    }

    this.player.pause();
    return await message.channel.send(`Player foi pausado!`);
  };

  /** The remove command is kind of funny because if the person desires,
   * it can remove using boolean numbers or hexadecimals. Like: 0b0011,
   * which I don't intend to "fix", it is not a problem.
   *
   * The person sees the queue starting at 1, but the queue is an array,
   * so it starts at 0. */
  remove = async (message: Message, args: string[]) => {
    if (message.member?.voice.channel !== this.channel) {
      return await message.reply(
        `Você precisa estar no mesmo canal que a pessoa que está ouvindo!`
      );
    }

    const index = Number(args[0]);
    if (index > this.queue.length) {
      return await message.reply(`Não existe música na posição ${index}`);
    }
    const removedSong = this.queue.splice(index - 1, 1);
    return await message.reply(`Removida a música na posição: ${index}: ${removedSong[0].title}`);
  };

  /** This loop is not perfect, if someone uses the command multiples times,
   * the current track will be multiplied inside the queue, which is not a
   * desirable outcome. */
  loop = async (message: Message) => {
    if (message.member?.voice.channel !== this.channel) {
      return await message.reply(
        `Você precisa estar no mesmo canal que a pessoa que está ouvindo!`
      );
    }

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
