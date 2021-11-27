import { Client, Message, MessageReaction } from 'discord.js';
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import ytsr from 'ytsr';
import { addToQueueEmbed } from './embeds/addToQueueEmbed';
import { createQueueEmbed } from './embeds/createQueueEmbed';
import { YouTubeResultItem } from './interfaces/YoutubeResultItem';
import { QueueItem } from './interfaces/QueueItem';
import spotifyAuth from './SpotifyAuth';
import logger from '../../logger/Logger';

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

  /** Used to avoid repetition, these objects are pushed to this.queue or sent to the queue embed.
   * Since there is a lot of dependencies that return different keys for their objects this is kind
   * of necessary, there is no meaning in filtering these objects, it would cost performance.
   */
  private songObject = {
    // ytpl format
    ytPlaylist: (song: ytpl.Item) => ({
      url: song.shortUrl,
      title: song.title,
      duration: song.duration as string,
      thumbnail: song.bestThumbnail.url as string,
    }),
    // ytdl format
    ytVideo: (song: ytdl.videoInfo) => ({
      url: song.videoDetails.video_url,
      title: song.videoDetails.title,
      duration: song.videoDetails.lengthSeconds as string,
      thumbnail: song.videoDetails.thumbnails[0].url as string,
    }),
    // ytsr format
    ytSearch: (song: YouTubeResultItem) => ({
      url: song.url,
      title: song.title,
      duration: song.duration as string,
      thumbnail: song.bestThumbnail.url as string,
    }),
  };

  addToQueue = async (client: Client, message: Message, args: string[]) => {
    const searchStringOrUrl = args.join(' ');
    const youtubeUrlString = 'https://www.youtube.com/watch?v=';

    const isASpotifyUrl = spotifyAuth.isAValidSpotifyUrl(searchStringOrUrl);

    const searchOptions = { limit: 5, pages: 1 };

    if (isASpotifyUrl) {
      try {
        const { type, id } = isASpotifyUrl;

        if (type !== 'playlist') return await message.reply('Somente playlist são suportadas.');

        logger.start(
          `spotify${message.guildId}`,
          'DEBUG',
          'Adding spotify playlist to queue',
          new Error()
        );

        const { items: songs } = await spotifyAuth.getPlaylistFromSpotify(id);
        const ytResults = await Promise.all(
          songs.map((song) =>
            ytsr(`${song.track.name} ${song.track.artists[0].name}`, searchOptions)
          )
        );

        const sendToQueue = ytResults.map(({ items }) => {
          const song = items.find((song2) => song2.type === 'video') as YouTubeResultItem;

          return this.songObject.ytSearch(song);
        });

        this.queue.push(...sendToQueue);

        logger.finish(
          `spotify${message.guildId}`,
          'DEBUG',
          `Finished adding spotify playlist to queue. Spotify link: ${searchStringOrUrl}`,
          new Error()
        );

        return await message.reply('Playlist do spotify adicionada!');
      } catch (err: any) {
        logger.log(
          'ERROR',
          'Error while trying to add a spotify playlist to queue',
          new Error(err)
        );
        await message.reply('Ocorreu um erro ao tentar adicionar a sua playlist do spotify.');
        throw new Error(err);
      }
    }

    const isAPlaylist = ytpl.validateID(searchStringOrUrl);

    if (isAPlaylist) {
      try {
        const playlist = await ytpl(searchStringOrUrl, searchOptions);
        const { items: songs } = playlist;
        songs.forEach((song) => this.queue.push(this.songObject.ytPlaylist(song)));

        return await message.reply(`A playlist: ${playlist.title} foi adicionada!`);
      } catch (err: any) {
        logger.log(
          'ERROR',
          'Error while trying to add a youtube playlist to queue',
          new Error(err)
        );
        await message.reply(
          `Ocorreu um erro ao tentarmos adicionar sua playlist, ela é realmente válida?`
        );
        throw new Error(err);
      }
    }

    const isAValidVideo = ytdl.validateURL(searchStringOrUrl);

    if (isAValidVideo) {
      try {
        const videoId = ytdl.getURLVideoID(searchStringOrUrl);
        const song = await ytdl.getBasicInfo(youtubeUrlString + videoId, {
          requestOptions: {
            headers: {
              cookie: process.env.YOUTUBE_LOGIN_COOKIE,
            },
          },
        });
        this.queue.push(this.songObject.ytVideo(song));
        if (this.currentlyPlaying !== null) {
          const embed = addToQueueEmbed(
            message,
            this.currentlyPlaying,
            this.songObject.ytVideo(song),
            this.queue
          );
          return await message.reply({ embeds: [embed] });
        }
        return { content: 'Song added to queue.' };
      } catch (err: any) {
        logger.log(
          'ERROR',
          `There was an error trying to add a video URL: ${searchStringOrUrl}`,
          new Error(err)
        );
        await message.reply(
          `Ocorreu um erro ao tentarmos adicionar seu video, ele é realmente válido?`
        );
        throw new Error(err);
      }
    }

    try {
      const { items: songs } = await ytsr(searchStringOrUrl, searchOptions);

      const song = songs.find((song2) => song2.type === 'video') as YouTubeResultItem;
      this.queue.push(this.songObject.ytSearch(song));
      if (this.currentlyPlaying !== null) {
        const embed = addToQueueEmbed(
          message,
          this.currentlyPlaying,
          this.songObject.ytSearch(song),
          this.queue
        );
        return await message.reply({ embeds: [embed] });
      }
      return { content: 'Song added to queue.' };
    } catch (err: any) {
      logger.log(
        'ERROR',
        `There was an error trying to search this: ${searchStringOrUrl}.`,
        new Error(err)
      );
      await message.reply(
        `Ocorreu um erro ao tentarmos adicionar sua pesquisa ou playlist, ela é realmente válida?`
      );
      throw new Error(err);
    }
  };

  getNextSong = () => {
    if (this.loopState) {
      if (this.queuePosition <= this.queue.length) this.queuePosition += 1;
      if (this.queuePosition > this.queue.length) this.queuePosition = 1;
      return this.queue[this.queuePosition - 1];
    }
    return this.queue.shift();
  };

  showQueue = async (client: Client, message: Message) => {
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

      const awaitReactions = async () => {
        await this.queueMessage
          ?.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] })
          .then(async (collected) => {
            const reaction = collected.first();
            if (reaction?.emoji.name === '➡️') {
              if (this.queue.length < this.queuePage + 10) await awaitReactions();
              this.queuePage += 10;
              const nextEmbed = await this.createQueueEmbed(message);

              await this.queueMessage?.edit({
                embeds: [nextEmbed],
              });
              await awaitReactions();
            }
            if (reaction?.emoji.name === '⬅️') {
              if (this.queuePage === 0) await awaitReactions();
              this.queuePage -= 10;
              const backEmbed = await this.createQueueEmbed(message);

              await this.queueMessage?.edit({
                embeds: [backEmbed],
              });
              await awaitReactions();
            }
            await awaitReactions();
          })
          .catch(async () => {
            if (this.queueMessage) {
              await this.queueMessage.delete();
              this.queueMessage = null;
              this.queuePage = 0;
            }
          });
      };
      await awaitReactions();
    }
    return { content: 'Queue embed deleted or never existed in the first place...' };
  };

  createQueueEmbed = async (message: Message) =>
    createQueueEmbed(message, this.currentlyPlaying as QueueItem, this.queue, this.queuePage);

  shuffleQueue = async (message: Message) => {
    for (let i = this.queue.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
    return await message.reply('A fila foi embaralhada!');
  };
}
