/* eslint-disable no-console */
import axios from 'axios';

class Webhook {
  private webhookURI: string;

  private userID: string;

  private messages: string[];

  constructor() {
    this.messages = [];
    this.webhookURI = process.env.DISCORD_WEBHOOK_URI as string;
    this.userID = process.env.DISCORD_WEBHOOK_USER_ID as string;
    setInterval(this.sendLog, 500);
  }

  sendLog = async () => {
    try {
      if (this.messages.length > 0) {
        await axios.post(this.webhookURI, {
          content: this.messages.shift(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  addMessage = (message: string) => {
    this.messages.push(message);
  };
}

const createClass = () => {
  if (process.env.DISCORD_WEBHOOK_URI_USE === 'TRUE') {
    return new Webhook();
  }
  return null;
};

export default createClass();
