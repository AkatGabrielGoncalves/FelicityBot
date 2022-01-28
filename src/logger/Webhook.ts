/* eslint-disable no-console */
import axios from 'axios';

class Webhook {
  webhookURI: string;

  constructor() {
    this.webhookURI = process.env.DISCORD_WEBHOOK_URI as string;
  }

  sendLog = async (
    type: 'ERROR' | 'WARN' | 'DEBUG' | 'INFO',
    message: string,
    err: Error,
    extra: any = ''
  ) => {
    try {
      await axios.post(
        'https://discord.com/api/webhooks/936096417653604373/iTuaMwmUB9v2QN9v18gk47e1Amfa_Ve6-cwjXrui3Kmz-Smm3LHHD8WlpIN4B6OD0vKp',
        {
          content: `type: ${type}\nmessage: ${message}\nerr: ${
            err.stack
          }\ndate: ${new Date()}\nextra: ${extra}\n<@333672963566075905>`,
        }
      );
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
