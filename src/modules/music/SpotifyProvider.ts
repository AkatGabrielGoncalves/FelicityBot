/*
This only exists because the Spotify Auth sucks, but you didn't hear that from me.
The purpose is to maintain a valid access token easily and easily renew it
*/
import axios, { AxiosResponse } from 'axios';
import Logger from '../../logger/Logger';
import SpotifyAuth from './SpotifyAuth';

interface ISpotifyPlaylistRes {
  // href: string;
  items: {
    track: {
      name: string;
      artists: {
        name: string;
      }[];
    };
  }[];
  // limit: number;
  // next: string;
  // offset: number;
  // previous: string;
  total: number;
}

interface ISpotifyTrackRes {
  artists: {
    name: string;
  }[];
  name: string;
}

interface ISpotifyAlbumRes {
  items: {
    artists: {
      name: string;
    }[];
    name: string;
  }[];
}

class SpotifyProvider extends SpotifyAuth {
  public readonly getPlaylistFromSpotify = async (id: string) => {
    try {
      const accessToken = await this.getAccessToken();
      const items = await this.getPlaylistURI(id, 0, accessToken);
      const { total } = items[0];

      if (total > 50) {
        const nextData = [];
        for (let i = 1; i < Math.ceil(total / 50) && i <= 1; i += 1) {
          nextData.push(this.getPlaylistURI(id, i * 50, accessToken));
        }
        (await Promise.all(nextData)).forEach((res) => {
          items.push(...res);
        });
      }

      return items.map((item) => `${item.artist} ${item.name}`);
    } catch (err: any) {
      Logger.log('ERROR', 'Error while trying to fetch the playlist tracks', err);
      throw err;
    }
  };

  public readonly getTrackFromSpotify = async (id: string) => {
    try {
      const accessToken = await this.getAccessToken();
      const { artist, name } = await this.getTrackURI(id, accessToken);

      return [`${artist} ${name}`];
    } catch (err: any) {
      Logger.log('ERROR', 'Error while trying to fetch the spotify track', err);
      throw err;
    }
  };

  public readonly getAlbumFromSpotify = async (id: string) => {
    try {
      const accessToken = await this.getAccessToken();
      const items = await this.getAlbumURI(id, accessToken);

      return items.map((item) => `${item.artist} ${item.name}`);
    } catch (err: any) {
      Logger.log('ERROR', 'Error while trying to fetch the spotify track', err);
      throw err;
    }
  };

  private readonly getPlaylistURI = async (id: string, offset: number, accessToken: string) => {
    const response: AxiosResponse<ISpotifyPlaylistRes> = await axios({
      method: 'GET',
      baseURL: `https://api.spotify.com/v1/playlists/${id}/tracks?fields=total,items(track(name,artists(name)))&limit=50&offset=${offset}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.items
      .filter((item) => item.track.name)
      .map((item) => ({
        artist: item.track.artists.map((artist) => artist.name).join(','),
        name: item.track.name,
        total: response.data.total,
      }));
  };

  private readonly getTrackURI = async (id: string, accessToken: string) => {
    const response: AxiosResponse<ISpotifyTrackRes> = await axios({
      method: 'GET',
      baseURL: `https://api.spotify.com/v1/tracks/${id}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      artist: response.data.artists.map((artist) => artist.name).join(','),
      name: response.data.name,
    };
  };

  private readonly getAlbumURI = async (id: string, accessToken: string) => {
    const response: AxiosResponse<ISpotifyAlbumRes> = await axios({
      method: 'GET',
      baseURL: `https://api.spotify.com/v1/albums/${id}/tracks`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.items.map((item) => ({
      artist: item.artists.map((artist) => artist.name).join(','),
      name: item.name,
    }));
  };

  public readonly isAValidSpotifyUrl = (
    url: string
  ): { type: 'track' | 'playlist' | 'album'; id: string } | null => {
    const spotifyIdRegex =
      /^(?:(?:http|https)(?::\/\/))?(?:open|play)\.spotify\.com\/(?:user\/spotify\/)?(track|playlist|album)\/([\w\d]+)/;

    const isValid = spotifyIdRegex.test(url);

    if (isValid) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, type, id] = url.match(spotifyIdRegex) as RegExpMatchArray;
      return {
        type,
        id,
      } as { type: 'track' | 'playlist' | 'album'; id: string };
    }
    return null;
  };
}

export default new SpotifyProvider();
