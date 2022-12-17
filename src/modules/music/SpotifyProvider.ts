/*
This only exists because the Spotify Auth sucks, but you didn't hear that from me.
The purpose is to maintain a valid access token easily and easily renew it
*/
import axios, { AxiosResponse } from 'axios';
import Logger from '../../logger/Logger';
import SpotifyAuth from './SpotifyAuth';

interface ISpotifyPlaylistTracksRes {
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

interface ISpotifyPlaylistRes {
  name: string;
  external_urls: {
    spotify: string;
  };
}

interface ISpotifyTrackRes {
  artists: {
    name: string;
  }[];
  name: string;
  external_urls: {
    spotify: string;
  };
}

interface ISpotifyAlbumTracksRes {
  items: {
    artists: {
      name: string;
    }[];
    name: string;
  }[];
}

interface ISpotifyAlbumRes {
  name: string;
  external_urls: {
    spotify: string;
  };
}

class SpotifyProvider extends SpotifyAuth {
  public readonly getPlaylistFromSpotify = async (id: string) => {
    try {
      const accessToken = await this.getAccessToken();
      const { title, url } = await this.getPlaylistInfo(id, accessToken);
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

      return { items: items.map((item) => `${item.artist} ${item.name}`), title, url };
    } catch (err: any) {
      Logger.error('Error while trying to fetch the playlist tracks', err);
      throw err;
    }
  };

  public readonly getTrackFromSpotify = async (id: string) => {
    try {
      const accessToken = await this.getAccessToken();
      const { artist, title, url } = await this.getTrackURI(id, accessToken);

      return { items: [`${artist} ${title}`], title, url };
    } catch (err: any) {
      Logger.error('Error while trying to fetch the spotify track', err);
      throw err;
    }
  };

  public readonly getAlbumFromSpotify = async (id: string) => {
    try {
      const accessToken = await this.getAccessToken();
      const { items, title, url } = await this.getAlbumURI(id, accessToken);

      return { items: items.map((item) => `${item.artist} ${item.name}`), title, url };
    } catch (err: any) {
      Logger.error('Error while trying to fetch the spotify track', err);
      throw err;
    }
  };

  private readonly getPlaylistURI = async (id: string, offset: number, accessToken: string) => {
    const response: AxiosResponse<ISpotifyPlaylistTracksRes> = await axios({
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

  private readonly getPlaylistInfo = async (id: string, accessToken: string) => {
    const {
      data: { name, external_urls },
    }: AxiosResponse<ISpotifyPlaylistRes> = await axios({
      method: 'GET',
      baseURL: `https://api.spotify.com/v1/playlists/${id}?fields=name,external_urls`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return { title: name, url: external_urls.spotify };
  };

  private readonly getTrackURI = async (id: string, accessToken: string) => {
    const {
      data: { artists, name, external_urls },
    }: AxiosResponse<ISpotifyTrackRes> = await axios({
      method: 'GET',
      baseURL: `https://api.spotify.com/v1/tracks/${id}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      artist: artists.map((artist) => artist.name).join(','),
      title: name,
      url: external_urls.spotify,
    };
  };

  private readonly getAlbumURI = async (id: string, accessToken: string) => {
    const {
      data: { items },
    }: AxiosResponse<ISpotifyAlbumTracksRes> = await axios({
      method: 'GET',
      baseURL: `https://api.spotify.com/v1/albums/${id}/tracks`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const {
      data: { name, external_urls },
    }: AxiosResponse<ISpotifyAlbumRes> = await axios({
      method: 'GET',
      baseURL: `https://api.spotify.com/v1/albums/${id}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      items: items.map((item) => ({
        artist: item.artists.map((artist) => artist.name).join(','),
        name: item.name,
      })),
      title: name,
      url: external_urls.spotify,
    };
  };
}

export default new SpotifyProvider();
