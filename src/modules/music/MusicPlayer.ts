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
  conn: VoiceConnection | null;

  queue: YouTubeResultItem[];

  player: AudioPlayer;

  subscription: PlayerSubscription | null | undefined;

  channel: VoiceChannel | StageChannel;

  message: Message;

  client: Client<boolean>;

  constructor(client: Client, message: Message) {
    this.client = client;
    this.message = message;
    this.channel = message.member?.voice.channel as VoiceChannel | StageChannel;
    this.conn = connectToChannel(this.channel);
    this.queue = [];
    this.player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
    this.subscription = this.conn.subscribe(this.player);

    this.player.on(AudioPlayerStatus.Idle, () => {
      if (this.queue[0]) this.continueQueue();
      if (
        !this.queue[0] &&
        this.player.state.status !== AudioPlayerStatus.Playing &&
        this.player.state.status !== AudioPlayerStatus.Buffering
      )
        handleStop(this.client, this.message);
    });
  }

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

    if (args.join('')) {
      ytsr(args.join(' '), {
        limit: 5,
        pages: 1,
      })
        .then(async (response: any) => {
          const responseItem = response.items.find(
            (item: YouTubeResultItem) => item.type === 'video'
          );
          this.queue.unshift(responseItem);
          if (
            this.player.state.status !== AudioPlayerStatus.Playing &&
            this.player.state.status !== AudioPlayerStatus.Buffering
          ) {
            const song = this.queue.pop() as YouTubeResultItem;

            const stream = await ytdl(song.url, {
              filter: 'audioonly',
              quality: 'lowestaudio',
              requestOptions: {
                headers: {
                  cookie: process.env.YOUTUBE_LOGIN_COOKIE,
                },
              },
            });

            const audioResource = createAudioResource(stream);
            this.player.play(audioResource);
            message.channel.send(`Tocando: ${song.title}`);
          }
          message.channel.send(`Adicionado a fila: ${responseItem.title}`);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  continueQueue = () => {
    const song = this.queue.pop() as YouTubeResultItem;
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
    return this.message.channel.send(`Tocando: ${song.title}`);
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
}
