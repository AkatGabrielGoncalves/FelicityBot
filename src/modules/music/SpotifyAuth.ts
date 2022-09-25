import axios from 'axios';
import Logger from '../../logger/Logger';

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
            Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
              'base64'
            )}`,
            'Content-type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = data.access_token;
      /* I don't want to get fu* if the Date.now() is not precise,
      so I'm removing 10 minutes from the token time */
      this.accessTokenExpiresIn = data.expires_in - 600 + Date.now() / 1000;
      return this.accessToken;
    } catch (err: any) {
      Logger.error('Error while trying to get the spotify token.', err);
      throw err;
    }
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

export default SpotifyAuth;
