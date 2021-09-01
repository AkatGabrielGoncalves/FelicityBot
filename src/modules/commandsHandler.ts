import { Client, Message } from 'discord.js';
import { commands } from './commands';

export const commandsHandler = async (
  client: Client,
  prefix: string,
  message: Message
) => {
  // This is to prevent the bot from interacting with other bots and other prefixes or no prefixes
  if (message.author.bot || !message.content.startsWith(prefix)) {
    return null;
  }

  // This will separate the message command and his arguments
  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift()?.toLowerCase() as string;

  // Here we will use the command as a key to return the correct response for each command
  try {
    return commands[command](client, message, args);
  } catch {
    return null;
  }
};
