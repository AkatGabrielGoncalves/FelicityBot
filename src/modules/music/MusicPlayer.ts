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
import search, { YouTubeSearchResults } from 'youtube-search';
import { connectToChannel } from '../helpers/connectToChannel';

export const connections: { [key: string]: MusicPlayer } = {};

export class MusicPlayer {
  conn: VoiceConnection | null;

  queue: YouTubeSearchResults[];

  player: AudioPlayer;

  subscription: PlayerSubscription | null | undefined;

  channel: VoiceChannel | StageChannel;

  message: Message;

  constructor(message: Message) {
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

    if (args[0]) {
      search(args.join(' '), {
        maxResults: 1,
        key: process.env.GOOGLE_API_KEY,
      })
        .then((response) => {
          this.queue.unshift(response.results[0]);
          if (
            this.player.state.status !== AudioPlayerStatus.Playing &&
            this.player.state.status !== AudioPlayerStatus.Buffering
          ) {
            const song = this.queue.pop() as YouTubeSearchResults;
            const stream = ytdl(song.link, {
              quality: 'lowestaudio',
            });
            const audioResource = createAudioResource(stream);
            this.player.play(audioResource);
            message.channel.send(`Tocando: ${song.title}`);
          }
          message.channel.send(`Adicionado a fila: ${response.results[0].title}`);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  continueQueue = () => {
    const song = this.queue.pop() as YouTubeSearchResults;
    const stream = ytdl(song.link, {
      quality: 'lowestaudio',
    });
    const audioResource = createAudioResource(stream);
    this.player.play(audioResource);
    this.message.channel.send(`Tocando: ${song.title}`);
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
