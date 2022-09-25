/* eslint-disable no-console */
import axios from 'axios';

class Webhook {
  webhookURI: string;

  userID: string;

  constructor() {
    this.webhookURI = process.env.DISCORD_WEBHOOK_URI as string;
    this.userID = process.env.DISCORD_WEBHOOK_USER_ID as string;
  }

  sendLog = async (message: string) => {
    try {
      await axios.post(this.webhookURI, {
        message,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

const createClass = () => {
  if (process.env.DISCORD_WEBHOOK_URI_USE === 'TRUE') {
    return new Webhook();
  }
  return null;
};

export default createClass();
