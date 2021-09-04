import { Client, Message } from 'discord.js';
import { commands } from './commands';
import serverInfo from './serverInfo.json';

export const commandsHandler = async (client: Client, message: Message) => {
  const guildId = message.guildId as string;

  const serverPrefixes = serverInfo as { [key: string]: string };
  let prefix = serverPrefixes[guildId];
  if (!prefix) prefix = '!';

  // This is to prevent the bot from interacting with other bots and other prefixes or no prefixes
  if (message.author.bot || !message.content.startsWith(prefix)) {
    return null;
  }

  // This will separate the message command and his arguments
  const noExtraSpaces = message.content.replace(/\s+/g, ' ').trim();
  const commandBody = noExtraSpaces.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift()?.toLowerCase() as string;

  // Here we will use the command as a key to return the correct response for each command
  try {
    return commands[command](client, message, args);
  } catch {
    return null;
  }
};
