/* eslint-disable no-console */
import axios from 'axios';

class Webhook {
  webhookURI: string;

  userID: string;

  constructor() {
    this.webhookURI = process.env.DISCORD_WEBHOOK_URI as string;
    this.userID = process.env.DISCORD_WEBHOOK_USER_ID as string;
  }

  sendLog = async (
    type: 'ERROR' | 'WARN' | 'DEBUG' | 'INFO',
    message: string,
    err: Error,
    extra: any = ''
  ) => {
    try {
      await axios.post(this.webhookURI, {
        content: `type: ${type}\nmessage: ${message}\nerr: ${
          err.stack
        }\ndate: ${new Date()}\nextra: ${extra}\n<@${this.userID}>`,
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
