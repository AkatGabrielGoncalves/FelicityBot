import { Client, Message, MessageReaction } from 'discord.js';
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import ytsr from 'ytsr';
// import SpotifyWebApi from 'spotify-web-api-node';
import { addToQueueEmbed } from './embeds/addToQueueEmbed';
import { createQueueEmbed } from './embeds/createQueueEmbed';
import { YouTubeResultItem } from './interfaces/YoutubeResultItem';
import { QueueItem } from './interfaces/QueueItem';

export class PlayerQueue {
  queue: QueueItem[];

  queuePage: number;

  queueMessage: Message | null | undefined;

  currentlyPlaying: QueueItem | null;

  // spotifyApi: SpotifyWebApi;

  constructor() {
    this.queue = [];
    this.queuePage = 0;
    this.queueMessage = null;
    this.currentlyPlaying = null;
    // this.spotifyApi = new SpotifyWebApi({
    //   clientId: '',
    //   clientSecret: '',
    // });
  }

  addToQueue = async (client: Client, message: Message, args: string[]) => {
    const searchStringOrUrl = args.join(' ');
    const youtubeUrlString = 'https://www.youtube.com/watch?v=';

    // const isASpotifyUrl = this.isAValidSpotifyUrl(searchStringOrUrl);

    // if (isASpotifyUrl) {
    //   const { type, id } = isASpotifyUrl;
    //   this.getPlaylistFromSpotify(type, id, message);
    // }

    const isAPlaylist = ytpl.validateID(searchStringOrUrl);
    const searchOptions = { limit: 5, pages: 1 };

    if (isAPlaylist) {
      try {
        const playlist = await ytpl(searchStringOrUrl, searchOptions);
        const { items: songs } = playlist;
        songs.forEach((song) =>
          this.queue.push({
            url: song.url,
            title: song.title,
            duration: song.duration as string,
            thumbnail: song.bestThumbnail.url as string,
          })
        );
        return await message.reply(`A playlist: ${playlist.title} foi adicionada!`);
      } catch (err) {
        console.log('Erro 2');
        console.log(err);
        return await message.reply(
          `Ocorreu um erro ao tentarmos adicionar sua playlist, ela é realmente válida?`
        );
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
        this.queue.push({
          url: song.videoDetails.video_url,
          title: song.videoDetails.title,
          duration: song.videoDetails.lengthSeconds as string,
          thumbnail: song.videoDetails.thumbnails[0].url as string,
        });
        if (this.currentlyPlaying !== null) {
          const embed = addToQueueEmbed(
            message,
            this.currentlyPlaying,
            {
              url: song.videoDetails.video_url,
              title: song.videoDetails.title,
              duration: song.videoDetails.lengthSeconds as string,
              thumbnail: song.videoDetails.thumbnails[0].url as string,
            },
            this.queue
          );
          return await message.reply({ embeds: [embed] });
        }
        return null;
      } catch (err) {
        console.log('Erro 4');
        console.log(err);
        return await message.reply(
          `Ocorreu um erro ao tentarmos adicionar seu video, ele é realmente válido?`
        );
      }
    }

    try {
      const { items: songs } = await ytsr(searchStringOrUrl, searchOptions);

      const song = songs.find(
        (song2) => song2.type === 'video'
      ) as YouTubeResultItem;
      this.queue.push({
        url: song.url,
        title: song.title,
        duration: song.duration as string,
        thumbnail: song.bestThumbnail.url as string,
      });
      if (this.currentlyPlaying !== null) {
        const embed = addToQueueEmbed(
          message,
          this.currentlyPlaying,
          {
            url: song.url,
            title: song.title,
            duration: song.duration as string,
            thumbnail: song.bestThumbnail.url as string,
          },
          this.queue
        );
        return await message.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.log('Erro 5');
      console.log(err);
      return await message.reply(
        `Ocorreu um erro ao tentarmos adicionar sua pesquisa ou playlist, ela é realmente válida?`
      );
    }
    return null;
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
        ['⬅️', '➡️'].includes(reaction.emoji.name as string) &&
        user.id !== client.user?.id;

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
            await this.queueMessage?.delete();
            this.queueMessage = null;
            this.queuePage = 0;
          });
      };
      await awaitReactions();
    }
    return null;
  };

  createQueueEmbed = async (message: Message) =>
    createQueueEmbed(
      message,
      this.currentlyPlaying as QueueItem,
      this.queue,
      this.queuePage
    );

  // getPlaylistFromSpotify = async (type: string, id: string, message: Message) => {
  //   if (type === 'playlist') {
  //     const response = await this.spotifyApi.getPlaylistTracks(id, {
  //       market: 'US',
  //       fields: 'items',
  //     });
  //     if (response.statusCode !== 200)
  //       return message.reply(`Não consegui tocar a sua playlist!`);

  //     const songs = response.body;
  //     console.log(songs);
  //   }

  //   return null;
  // };

  // isAValidSpotifyUrl = (url: string) => {
  //   const spotifyIdRegex =
  //     /^(?:(?:http|https)(?::\/\/))?(?:open|play)\.spotify\.com\/(?:user\/spotify\/)?(track|playlist)\/([\w\d]+)/;

  //   const isValid = spotifyIdRegex.test(url);

  //   if (isValid) {
  //     const [_, type, id] = url.match(spotifyIdRegex) as RegExpMatchArray;
  //     return {
  //       type,
  //       id,
  //     };
  //   }
  //   return null;
  // };
}
