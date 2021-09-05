/* eslint-disable import/no-cycle */
import { StageChannel, VoiceChannel, Client, Message } from 'discord.js';
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  PlayerSubscription,
  VoiceConnection,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
import ytsr from 'ytsr';
import ytpl, { Item as YouTubePlaylistResultItem } from 'ytpl';
import { connectToChannel } from '../helpers/connectToChannel';
import { YouTubeResultItem } from './interfaces/YoutubeResultItem';
import { handleStop } from './stop';

export const connections: { [key: string]: MusicPlayer } = {};

export class MusicPlayer {
  private conn: VoiceConnection | null;

  private queue: (YouTubeResultItem | YouTubePlaylistResultItem)[];

  private player: AudioPlayer;

  private subscription: PlayerSubscription | undefined;

  private channel: VoiceChannel | StageChannel;

  private message: Message;

  private client: Client<boolean>;

  private currentlyPlaying: YouTubeResultItem | string;

  constructor(client: Client, message: Message) {
    this.client = client;
    this.message = message;
    this.channel = message.member?.voice.channel as VoiceChannel | StageChannel;
    this.conn = connectToChannel(this.channel);
    this.queue = [];
    this.currentlyPlaying = '';
    this.player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      },
    });
    this.subscription = this.conn.subscribe(this.player);

    this.player.on(AudioPlayerStatus.Idle, () => {
      if (this.queue[0]) this.continueQueue();
      if (!this.queue[0] && this.isPlayerNotBusy())
        handleStop(this.client, this.message);
    });
  }

  private playAudio = async () => {
    try {
      const song = this.queue.shift() as YouTubeResultItem;
      const stream = ytdl(song.url, {
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
      return await this.message.channel.send(`Tocando: ${song.title}`);
    } catch (err) {
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
        console.log(err);
      }
    }

    const isAValidVideo = ytdl.validateURL(ytSearchStringOrUrl);
    const searchAndAdd = async (search: string) => {
      const { items: songs } = await ytsr(search, searchOptions);
      const song = songs.find(
        (song2) => song2.type === 'video'
      ) as YouTubeResultItem;
      this.queue.push(song);
      return await message.reply(`Adicionado a fila: ${song.title}`);
    };

    if (isAValidVideo) {
      try {
        const videoId = ytdl.getURLVideoID(ytSearchStringOrUrl);
        const ytUrl = youtubeDefaultUrl + videoId;
        return searchAndAdd(ytUrl);
      } catch (err) {
        console.log(err);
      }
    }

    try {
      return searchAndAdd(ytSearchStringOrUrl);
    } catch (err) {
      console.log(err);
      return message.reply(
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
    this.conn?.destroy();
    message.channel.send(`Player foi parado!`);
  };

  pause = async (message: Message) => {
    this.player.pause();
    message.channel.send(`Player foi pausado!`);
  };

  showQueue = async (message: Message) => {
    if (!this.queue[0] && typeof this.currentlyPlaying !== 'string') {
      return await message.reply(
        `A música atual é ${this.currentlyPlaying.title}\nNão há músicas na fila!`
      );
    }
    if (typeof this.currentlyPlaying !== 'string') {
      return await message.reply(
        `A música atual é: ${
          this.currentlyPlaying.title
        }\nA fila atual é:\n${this.queue.map((song) => `${song.title}\n`).join('')}`
      );
    }
    return null;
  };
}
