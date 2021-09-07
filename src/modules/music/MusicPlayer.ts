import ytpl, { Item as YouTubePlaylistResultItem } from 'ytpl';
/* eslint-disable import/no-cycle */
import {
  StageChannel,
  VoiceChannel,
  Client,
  Message,
  MessageReaction,
} from 'discord.js';
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  NoSubscriberBehavior,
  PlayerSubscription,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import ytdl from 'ytdl-core-discord';
import ytsr from 'ytsr';
import { createQueueEmbed } from './embeds/createQueueEmbed';
import { connectToChannel } from '../helpers/connectToChannel';
import { YouTubeResultItem } from './interfaces/YoutubeResultItem';
import { handleStop } from './stop';
import { playingEmbed } from './embeds/playingEmbed';
import { addToQueueEmbed } from './embeds/addToQueueEmbed';

export class MusicPlayer {
  private conn: VoiceConnection | null;

  public queue: (YouTubeResultItem | YouTubePlaylistResultItem)[];

  player: AudioPlayer;

  private subscription: PlayerSubscription | undefined;

  private channel: VoiceChannel | StageChannel;

  private message: Message;

  private client: Client<boolean>;

  public currentlyPlaying: YouTubeResultItem | null;

  queuePage: number;

  queueMessage: Message | null | undefined;

  constructor(client: Client, message: Message) {
    this.client = client;
    this.message = message;
    this.channel = message.member?.voice.channel as VoiceChannel | StageChannel;
    this.conn = connectToChannel(this.channel);
    this.queue = [];
    this.queuePage = 0;
    this.queueMessage = null;
    this.currentlyPlaying = null;
    this.player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      },
    });
    this.subscription = this.conn.subscribe(this.player);

    this.conn.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        if (this.conn !== null) {
          await Promise.race([
            entersState(this.conn, VoiceConnectionStatus.Signalling, 5_000),
            entersState(this.conn, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        }
      } catch (error) {
        this.queue = [];
        handleStop(this.client, this.message);
      }
    });

    this.conn.on(VoiceConnectionStatus.Ready, async () => {
      if (this.currentlyPlaying !== null) {
        this.queue.unshift(this.currentlyPlaying);
        await this.playAudio();
      }
    });

    this.player.on(AudioPlayerStatus.Idle, async () => {
      try {
        if (
          this.queue[0] &&
          this.isPlayerNotBusy() &&
          this.conn?.state.status === 'ready'
        ) {
          if (this.channel.members.size === 1)
            await handleStop(this.client, this.message);

          await this.continueQueue();
        }
        if (
          !this.queue[0] &&
          this.isPlayerNotBusy() &&
          this.conn?.state.status === 'ready'
        ) {
          await handleStop(this.client, this.message);
        }
      } catch (err) {
        console.log('erro no listener');
        console.log(err);
      }
    });
  }

  private playAudio = async () => {
    try {
      const song = this.queue.shift() as YouTubeResultItem &
        YouTubePlaylistResultItem;

      const { url } = song;
      console.log(url);
      const stream = await ytdl(url, {
        requestOptions: {
          headers: {
            cookie: process.env.YOUTUBE_LOGIN_COOKIE,
          },
        },
      });
      const audioResource = createAudioResource(stream, {
        inputType: StreamType.Opus,
      });
      this.player.play(audioResource);
      this.currentlyPlaying = song;
      const embed = playingEmbed(this.message, this.currentlyPlaying);
      return await this.message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log('Erro 1');
      console.log(err);
      return this.message.reply(`Ocorreu um erro ao tentar reproduzir o video!`);
    }
  };

  private continueQueue = () => this.playAudio();

  private isPlayerNotBusy = () =>
    this.player.state.status !== AudioPlayerStatus.Playing &&
    this.player.state.status !== AudioPlayerStatus.Buffering;

  private addToQueue = async (message: Message, args: string[]) => {
    const youtubeDefaultUrl = 'https://www.youtube.com/watch?v=';
    const ytSearchStringOrUrl = args.join(' ');
    const isAPlaylist = ytpl.validateID(ytSearchStringOrUrl);
    const searchOptions = { limit: 5, pages: 1 };

    if (isAPlaylist) {
      try {
        const playlist = await ytpl(ytSearchStringOrUrl, searchOptions);
        const { items: songs } = playlist;
        songs.forEach((song) => this.queue.push(song));
        return await message.reply(`A playlist: ${playlist.title} foi adicionada!`);
      } catch (err) {
        console.log('Erro 2');
        console.log(err);
        return await message.reply(
          `Ocorreu um erro ao tentarmos adicionar sua playlist, ela é realmente válida?`
        );
      }
    }

    let isAValidVideo;
    try {
      isAValidVideo = ytdl.validateURL(ytSearchStringOrUrl);
    } catch (err) {
      console.log('Erro 3');
      console.log(err);
    }

    const searchAndAdd = async (search: string) => {
      const { items: songs } = await ytsr(search, searchOptions);
      const song = songs.find(
        (song2) => song2.type === 'video'
      ) as YouTubeResultItem;
      this.queue.push(song);
      if (this.currentlyPlaying !== null) {
        const embed = addToQueueEmbed(
          message,
          this.currentlyPlaying as YouTubeResultItem,
          song,
          this.queue
        );
        return await message.reply({ embeds: [embed] });
      }
      return null;
    };

    if (isAValidVideo) {
      try {
        const videoId = ytdl.getURLVideoID(ytSearchStringOrUrl);
        const ytUrl = youtubeDefaultUrl + videoId;
        return searchAndAdd(ytUrl);
      } catch (err) {
        console.log('Erro 4');
        console.log(err);
        return await message.reply(
          `Ocorreu um erro ao tentarmos adicionar seu video, ele é realmente válido?`
        );
      }
    }

    try {
      return searchAndAdd(ytSearchStringOrUrl);
    } catch (err) {
      console.log('Erro 5');
      console.log(err);
      return await message.reply(
        `Ocorreu um erro ao tentarmos adicionar sua pesquisa ou playlist, ela é realmente válida?`
      );
    }
  };

  // eslint-disable-next-line consistent-return
  play = async (client: Client, message: Message, args: string[]) => {
    this.message = message;
    if (message.member?.voice.channel !== this.channel) {
      const someoneIsListening = this.channel.members.size > 1;
      if (message.member?.voice.channel && !someoneIsListening) {
        this.conn = connectToChannel(message.member?.voice.channel);
      }
      return message.reply(
        `Você precisa estar no mesmo canal que a pessoa que está ouvindo!`
      );
    }

    if (this.player.state.status === AudioPlayerStatus.Paused) {
      this.player.unpause();
    }

    const argsExist = args[0];

    if (argsExist) {
      await this.addToQueue(message, args);

      if (this.isPlayerNotBusy()) {
        return this.playAudio();
      }
    }
  };

  next = async (message: Message) => {
    this.player.stop();
    message.channel.send(`Tocando próxima música!`);
  };

  stop = async (message: Message) => {
    this.queue = [];
    this.conn?.removeAllListeners();
    this.conn?.destroy();
    this.player.removeAllListeners();
    message.channel.send(`Player foi parado!`);
  };

  pause = async (message: Message) => {
    this.player.pause();
    message.channel.send(`Player foi pausado!`);
  };

  remove = async (message: Message, args: string[]) => {
    const index = Number(args[0]);
    if (index > this.queue.length)
      return await message.reply(`Não existe música na posição ${index}`);
    const removedSong = this.queue.splice(index - 1, 1);
    return await message.reply(
      `Removida a música na posição: ${index}: ${removedSong[0].title}`
    );
  };

  showQueue = async (message: Message) => {
    if (this.currentlyPlaying !== null) {
      if (this.queueMessage) {
        await this.queueMessage.delete();
        this.queueMessage = null;
        this.queuePage = 0;
      }
      const embed = await this.createQueueEmbed();

      const filter = (reaction: MessageReaction, user: any) =>
        ['⬅️', '➡️'].includes(reaction.emoji.name as string) &&
        user.id !== this.client.user?.id;

      this.queueMessage = await await message.reply({ embeds: [embed] });
      await this.queueMessage.react('⬅️');
      await this.queueMessage.react('➡️');

      const awaitReactions = async () => {
        await this.queueMessage
          ?.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] })
          .then(async (collected) => {
            const reaction = collected.first();
            if (reaction?.emoji.name === '➡️') {
              if (this.queue.length < this.queuePage + 10) await awaitReactions();
              this.queuePage += 10;
              const nextEmbed = await this.createQueueEmbed();

              await this.queueMessage?.edit({
                embeds: [nextEmbed],
              });
              await awaitReactions();
            }
            if (reaction?.emoji.name === '⬅️') {
              if (this.queuePage === 0) await awaitReactions();
              this.queuePage -= 10;
              const backEmbed = await this.createQueueEmbed();

              await this.queueMessage?.edit({
                embeds: [backEmbed],
              });
              await awaitReactions();
            }
          })
          .catch(async () => {
            await this.queueMessage?.delete();
            this.queueMessage = null;
            this.queuePage = 0;
          });
      };
      await awaitReactions();
    }
    return null;
  };

  createQueueEmbed = async () =>
    createQueueEmbed(
      this.message,
      this.currentlyPlaying as YouTubeResultItem,
      this.queue,
      this.queuePage
    );
}
