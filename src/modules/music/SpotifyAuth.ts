/* 
This only exists because the Spotify Auth sucks, but you didn't hear that from me.
The purpose is to maintain a valid access token easily and easily renew it
*/
import axios from 'axios';

interface ISpotifyResponse {
  items: {
    track: {
      name: string;
      artists: {
        name: string;
      }[];
    };
  }[];
}

class SpotifyAuth {
  private clientId: string;

  private clientSecret: string;

  private accessToken: string;

  private accessTokenExpiresIn: number;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID as string;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET as string;
    this.accessToken = '';
    this.accessTokenExpiresIn = 0; // This is a timestamp which holds when the access token will expire.
  }

  public readonly getAccessToken = async () => {
    try {
      if (!this.isTokenExpired()) {
        return this.accessToken;
      }
      const { data } = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${this.clientId}:${this.clientSecret}`
            ).toString('base64')}`,
            'Content-type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = data.access_token;
      /* I don't want to get fu* if the Date.now() is not precise, 
      so I'm removing 10 minutes from the token time */
      this.accessTokenExpiresIn = data.expires_in - 600 + Date.now() / 1000;
      return this.accessToken;
    } catch (err) {
      throw new Error(
        `Ocorreu um erro ao tentar requisitar o token do spotify${err}`
      );
    }
  };

  /** Only playlists id, please. */
  public readonly getPlaylistFromSpotify = async (
    id: string
  ): Promise<ISpotifyResponse> => {
    try {
      const accessToken = await this.getAccessToken();
      const { data } = await axios({
        method: 'GET',
        baseURL: `https://api.spotify.com/v1/playlists/${id}/tracks?fields=items(track(name,artists(name)))&limit=50`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return data;
    } catch (err) {
      console.log('Error while trying to fetch the playlist tracks');
      throw new Error(`Error while trying to fetch the playlist tracks${err}`);
    }
  };

  /** This method actually can validate if it is a track or playlist, but I don't think I will
   * implement the track playing since there is no meaning, just write the track name ffs.
   */
  public readonly isAValidSpotifyUrl = (url: string) => {
    const spotifyIdRegex =
      /^(?:(?:http|https)(?::\/\/))?(?:open|play)\.spotify\.com\/(?:user\/spotify\/)?(track|playlist)\/([\w\d]+)/;

    const isValid = spotifyIdRegex.test(url);

    if (isValid) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, type, id] = url.match(spotifyIdRegex) as RegExpMatchArray;
      return {
        type,
        id,
      };
    }
    return null;
  };

  private readonly isTokenExpired = () => {
    if (!this.accessToken && !this.accessTokenExpiresIn) {
      return true;
    }

    if (this.accessTokenExpiresIn < Date.now() / 1000) {
      return true;
    }
    return false;
  };
}

export default new SpotifyAuth();
