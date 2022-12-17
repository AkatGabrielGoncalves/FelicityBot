import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  Client,
  ComponentType,
  Message,
} from 'discord.js';
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import { basicReply } from '../../utils/basicReply';
import { createQueueButton, createQueueEmbed } from './embeds/createQueueEmbed';
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
          return basicReply(message, 'Link do spotify não suportado', 'info');

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

        Logger.debug(`Adding spotify ${type} to queue`);

        const addingMessage = await basicReply(
          message,
          `Adicionando ${type} do spotify...`,
          'success'
        );

        const { getItems, getTrack } = spotifyTypesFunctions[type];

        const { items, title, url } = await getItems(id);

        const tracksInfo = await Promise.all(items.map((item) => getTrack(item)));
        this.queue.push(...tracksInfo.map((info) => info.track));

        Logger.debug(
          `Finished adding spotify ${type} to queue. Spotify link: ${searchStringOrUrl}`
        );

        return basicReply(
          addingMessage,
          `${type} do spotify adicionado(a)!\n[${title}](${url})`,
          'success'
        );
      }

      if (isAYtPlaylist) {
        argsType = 'Youtube Playlist';
        const { tracks, title, url } = await yt.getTrackFromPlaylist(searchStringOrUrl);
        this.queue.push(...tracks);

        return basicReply(message, `A playlist foi adicionada!\n[${title}](${url})`, 'success');
      }

      if (isAYtVideo) {
        argsType = 'Youtube Track';
        const { track, title, url } = await yt.getTrackFromURL(searchStringOrUrl);
        this.queue.push(track);

        return basicReply(message, `O video foi adicionado!\n[${title}](${url})`, 'success');
      }

      argsType = 'Pesquisa';
      const { track, title, url } = await yt.getTrackFromSearch(searchStringOrUrl);

      this.queue.push(track);

      return basicReply(message, `O video foi adicionado!\n[${title}](${url})`, 'success');
    } catch (err: any) {
      Logger.error(`There was an error trying to add this: ${searchStringOrUrl}.`, err);
      return basicReply(
        message,
        `Ocorreu um erro ao tentarmos adicionar um/uma ${argsType}, é realmente válido/válida?`,
        'error'
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

      const filter = (interaction: ButtonInteraction) =>
        interaction.isButton() && !interaction.component.disabled;

      const previousButton = createQueueButton('Previous Page', true);
      const nextButton = createQueueButton('Next Page', this.queue.length < this.queuePage + 10);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents([previousButton, nextButton]);

      this.queueMessage = await message.reply({
        embeds: [embed],
        components: [row],
        // @ts-ignore
        fetchReply: true,
      });

      await this.awaitButtonRes(filter, message);
    }
    return { content: 'Queue embed deleted or never existed in the first place...' };
  };

  public readonly shuffleQueue = async (message: Message) => {
    for (let i = this.queue.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
    return basicReply(message, 'A fila foi embaralhada!', 'success');
  };

  private readonly awaitButtonRes = async (
    filter: (interaction: ButtonInteraction) => boolean,
    message: Message
  ) => {
    await this.queueMessage
      ?.awaitMessageComponent({
        filter,
        componentType: ComponentType.Button,
        time: 30000,
      })
      .then(async (interaction: ButtonInteraction) => {
        if (interaction.component.label === 'Next Page') {
          if (this.queue.length > this.queuePage + 10) {
            this.queuePage += 10;
          }

          const nextEmbed = await this.createQueueEmbed(message);
          const previousButton = createQueueButton('Previous Page', false);
          const nextButton = createQueueButton(
            'Next Page',
            this.queue.length < this.queuePage + 10
          );

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
            previousButton,
            nextButton,
          ]);

          await interaction.update({
            embeds: [nextEmbed],
            components: [row],
          });
          await this.awaitButtonRes(filter, message);
        }
        if (interaction.component.label === 'Previous Page') {
          if (this.queuePage > 0) {
            this.queuePage -= 10;
          }

          const backEmbed = await this.createQueueEmbed(message);
          const previousButton = createQueueButton('Previous Page', this.queuePage === 0);
          const nextButton = createQueueButton(
            'Next Page',
            this.queue.length < this.queuePage + 10
          );

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
            previousButton,
            nextButton,
          ]);

          await interaction.update({
            embeds: [backEmbed],
            components: [row],
          });
          await this.awaitButtonRes(filter, message);
        }
      })
      .catch(async () => {
        if (this.queueMessage) {
          try {
            await this.queueMessage.delete();
          } catch (err: any) {
            if (err.status !== 404) Logger.error('Error when trying to delete message.', err);
          } finally {
            this.queueMessage = null;
            this.queuePage = 0;
          }
        }
      });
  };

  private readonly createQueueEmbed = async (message: Message) =>
    createQueueEmbed(message, this.currentlyPlaying as QueueItem, this.queue, this.queuePage);
}
