import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import ytsr from 'ytsr';
import { QueueItem } from './interfaces/QueueItem';
import { YouTubeResultItem } from './interfaces/YoutubeResultItem';

class YoutubeTracks {
  private readonly searchOptions: { limit: number; maxRetries: number };

  constructor() {
    this.searchOptions = { limit: 3, maxRetries: 5 };
  }

  private readonly songObject = {
    // ytpl format
    ytPlaylist: (song: ytpl.Item): QueueItem => ({
      url: song.shortUrl,
      title: song.title,
      duration: song.duration as string,
      thumbnail: song.bestThumbnail.url as string,
    }),
    // ytdl format
    ytVideo: (song: ytdl.videoInfo): QueueItem => ({
      url: song.videoDetails.video_url,
      title: song.videoDetails.title,
      duration: song.videoDetails.lengthSeconds as string,
      thumbnail: song.videoDetails.thumbnails[0].url as string,
    }),
    // ytsr format
    ytSearch: (song: YouTubeResultItem): QueueItem => ({
      url: song.url,
      title: song.title,
      duration: song.duration as string,
      thumbnail: song.bestThumbnail.url as string,
    }),
  };

  public readonly getTrackFromPlaylist = async (playlistURL: string): Promise<QueueItem[]> => {
    const { items } = await ytpl(playlistURL, this.searchOptions);
    return items.map((item) => this.songObject.ytPlaylist(item));
  };

  public readonly getTrackFromURL = async (trackURL: string): Promise<QueueItem> => {
    const youtubeUrl = 'https://www.youtube.com/watch?v=';
    const videoId = ytdl.getURLVideoID(trackURL);
    const track = await ytdl.getBasicInfo(youtubeUrl + videoId, {
      requestOptions: {
        headers: {
          cookie: process.env.YOUTUBE_LOGIN_COOKIE,
        },
      },
    });
    return this.songObject.ytVideo(track);
  };

  public readonly getTrackFromSearch = async (search: string): Promise<QueueItem> => {
    const { items } = await ytsr(search, this.searchOptions);
    const track = items.find((item) => item.type === 'video') as YouTubeResultItem;
    return this.songObject.ytSearch(track);
  };
}

export default new YoutubeTracks();
