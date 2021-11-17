/* 
This only exists because the Spotify Auth sucks, but you didn't hear that from me.
The purpose is to maintain a valid access token easily and easily renew it
*/
import axios from 'axios';
import querystring from 'querystring';

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

  public getAccessToken = async () => {
    try {
      if (!this.isTokenExpired()) {
        return this.accessToken;
      }
      const { data } = await axios.post(
        'https://accounts.spotify.com/api/token',
        querystring.stringify({
          grant_type: 'client_credentials',
        }),
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
      return new Error(
        `Ocorreu um erro ao tentar requisitar o token do spotify${err}`
      );
    }
  };

  private isTokenExpired = () => {
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
