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
import { connectToChannel } from '../helpers/connectToChannel';
import { YouTubeResultItem } from './interfaces/YoutubeResultItem';
import { handleStop } from './stop';

export const connections: { [key: string]: MusicPlayer } = {};

export class MusicPlayer {
  private conn: VoiceConnection | null;

  private queue: YouTubeResultItem[];

  private player: AudioPlayer;

  private subscription: PlayerSubscription | null | undefined;

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
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
    this.subscription = this.conn.subscribe(this.player);

    this.player.on(AudioPlayerStatus.Idle, () => {
      if (this.queue[0]) this.continueQueue();
      if (!this.queue[0] && this.isPlayerBusy())
        handleStop(this.client, this.message);
    });
  }

  private playAudio = async () => {
    const song = this.queue.pop() as YouTubeResultItem;
    const stream = ytdl(song.url, {
      filter: 'audioonly',
      quality: 'lowestaudio',
      requestOptions: {
        headers: {
          cookie: process.env.YOUTUBE_LOGIN_COOKIE,
        },
      },
      highWaterMark: 32000,
    });
    const audioResource = createAudioResource(stream);
    this.player.play(audioResource);
    this.currentlyPlaying = song;
    return await this.message.channel.send(`Tocando: ${song.title}`);
  };

  private continueQueue = () => this.playAudio();

  private isPlayerBusy = () =>
    this.player.state.status !== AudioPlayerStatus.Playing &&
    this.player.state.status !== AudioPlayerStatus.Buffering;

  play = async (client: Client, message: Message, args: string[]) => {
    this.message = message;
    if (message.member?.voice.channel !== this.channel) {
      if (message.member?.voice.channel) {
        this.conn = connectToChannel(message.member?.voice.channel);
      }
    }

    if (this.player.state.status === AudioPlayerStatus.Paused) {
      this.player.unpause();
    }

    if (args[0]) {
      ytsr(args.join(' '), {
        limit: 5,
        pages: 1,
      })
        .then(async (response: any) => {
          const responseItem = response.items.find(
            (item: YouTubeResultItem) => item.type === 'video'
          );
          this.queue.unshift(responseItem);
          if (this.isPlayerBusy()) {
            return this.playAudio();
          }
          return await message.channel.send(
            `Adicionado a fila: ${responseItem.title}`
          );
        })
        .catch((err) => {
          console.log(err);
        });
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
        }\n A fila atual é:\n${this.queue.map((song) => `${song.title}\n`).join('')}`
      );
    }
    return null;
  };
}
