import { Client, Message } from 'discord.js';

export default interface IExecuteParameters {
  client: Client;
  message: Message;
  args: string[];
}
