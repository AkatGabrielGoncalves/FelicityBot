import { Client, Message, MessageReaction } from 'discord.js';
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import { addToQueueEmbed } from './embeds/addToQueueEmbed';
import { createQueueEmbed } from './embeds/createQueueEmbed';
import { QueueItem } from './interfaces/QueueItem';
import sp from './SpotifyProvider';
import Logger from '../../logger/Logger';
import yt from './YoutubeTracks';

export class PlayerQueue {
  protected queue: QueueItem[];

  protected queuePage: number;

  protected queueMessage: Message | null | undefined;

  protected currentlyPlaying: QueueItem | null;

  protected loopState: boolean;

  protected queuePosition: number;

  constructor() {
    this.queue = [];
    this.queuePage = 0;
    this.queueMessage = null;
    this.currentlyPlaying = null;
    this.loopState = false;
    this.queuePosition = 0;
  }

  protected readonly addToQueue = async (client: Client, message: Message, args: string[]) => {
    const searchStringOrUrl = args.join(' ');

    const isASpotifyUrl = sp.isAValidSpotifyUrl(searchStringOrUrl);
    const isAYtPlaylist = ytpl.validateID(searchStringOrUrl);
    const isAYtVideo = ytdl.validateURL(searchStringOrUrl);

    let argsType = '';
    try {
      if (isASpotifyUrl) {
        argsType = 'Spotify Playlist/Track';
        const { type, id } = isASpotifyUrl;

        if (type !== 'playlist' && type !== 'track' && type !== 'album')
          return await message.reply('Link do spotify não suportado');

        const spotifyTypesFunctions = {
          playlist: {
            getItems: sp.getPlaylistFromSpotify,
            getTrack: yt.getTrackFromSearch,
          },
          album: {
            getItems: sp.getAlbumFromSpotify,
            getTrack: yt.getTrackFromSearch,
          },
          track: {
            getItems: sp.getTrackFromSpotify,
            getTrack: yt.getTrackFromSearch,
          },
        };

        Logger.start(
          `spotify${message.guildId}`,
          'DEBUG',
          `Adding spotify ${type} to queue`,
          new Error()
        );

        const { getItems, getTrack } = spotifyTypesFunctions[type];

        const items = await getItems(id);

        const tracks = await Promise.all(items.map((item) => getTrack(item)));
        this.queue.push(...tracks);

        Logger.finish(
          `spotify${message.guildId}`,
          'DEBUG',
          `Finished adding spotify ${type} to queue. Spotify link: ${searchStringOrUrl}`,
          new Error()
        );

        return await message.reply(`${type} do spotify adicionado(a)!`);
      }

      if (isAYtPlaylist) {
        argsType = 'Youtube Playlist';
        const tracks = await yt.getTrackFromPlaylist(searchStringOrUrl);
        this.queue.push(...tracks);

        return await message.reply(`A playlist foi adicionada!`);
      }

      if (isAYtVideo) {
        argsType = 'Youtube Track';
        const track = await yt.getTrackFromURL(searchStringOrUrl);
        this.queue.push(track);

        if (this.currentlyPlaying !== null) {
          const embed = addToQueueEmbed(message, this.currentlyPlaying, track, this.queue);
          return await message.reply({ embeds: [embed] });
        }
        return { content: 'Song added to queue.' };
      }

      argsType = 'Pesquisa';
      const track = await yt.getTrackFromSearch(searchStringOrUrl);

      this.queue.push(track);

      if (this.currentlyPlaying !== null) {
        const embed = addToQueueEmbed(message, this.currentlyPlaying, track, this.queue);
        return await message.reply({ embeds: [embed] });
      }

      return { content: 'Song added to queue.' };
    } catch (err: any) {
      Logger.log('ERROR', `There was an error trying to add this: ${searchStringOrUrl}.`, err);
      return await message.reply(
        `Ocorreu um erro ao tentarmos adicionar um/uma ${argsType}, é realmente válido/válida?`
      );
    }
  };

  protected readonly getNextSong = () => {
    if (this.loopState) {
      if (this.queuePosition <= this.queue.length) this.queuePosition += 1;
      if (this.queuePosition > this.queue.length) this.queuePosition = 1;
      return this.queue[this.queuePosition - 1];
    }
    return this.queue.shift();
  };

  public readonly showQueue = async (client: Client, message: Message) => {
    if (this.currentlyPlaying !== null) {
      if (this.queueMessage) {
        await this.queueMessage.delete();
        this.queueMessage = null;
        this.queuePage = 0;
      }
      const embed = await this.createQueueEmbed(message);

      const filter = (reaction: MessageReaction, user: any) =>
        ['⬅️', '➡️'].includes(reaction.emoji.name as string) && user.id !== client.user?.id;

      this.queueMessage = await message.reply({ embeds: [embed] });
      await this.queueMessage.react('⬅️');
      await this.queueMessage.react('➡️');

      await this.awaitReactions(filter, message);
    }
    return { content: 'Queue embed deleted or never existed in the first place...' };
  };

  public readonly shuffleQueue = async (message: Message) => {
    for (let i = this.queue.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
    return await message.reply('A fila foi embaralhada!');
  };

  private readonly awaitReactions = async (
    filter: (reaction: MessageReaction, user: any) => boolean,
    message: Message
  ) => {
    await this.queueMessage
      ?.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] })
      .then(async (collected) => {
        const reaction = collected.first();
        if (reaction?.emoji.name === '➡️') {
          if (this.queue.length < this.queuePage + 10) await this.awaitReactions(filter, message);
          this.queuePage += 10;
          const nextEmbed = await this.createQueueEmbed(message);

          await this.queueMessage?.edit({
            embeds: [nextEmbed],
          });
          await this.awaitReactions(filter, message);
        }
        if (reaction?.emoji.name === '⬅️') {
          if (this.queuePage === 0) await this.awaitReactions(filter, message);
          this.queuePage -= 10;
          const backEmbed = await this.createQueueEmbed(message);

          await this.queueMessage?.edit({
            embeds: [backEmbed],
          });
          await this.awaitReactions(filter, message);
        }
        await this.awaitReactions(filter, message);
      })
      .catch(async () => {
        if (this.queueMessage) {
          await this.queueMessage.delete();
          this.queueMessage = null;
          this.queuePage = 0;
        }
      });
  };

  private readonly createQueueEmbed = async (message: Message) =>
    createQueueEmbed(message, this.currentlyPlaying as QueueItem, this.queue, this.queuePage);
}
