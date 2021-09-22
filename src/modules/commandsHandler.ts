import { Client, Message } from 'discord.js';
import { Database } from '../database';
import { commands } from './commands';
import { retrieveConfig } from './helpers/retrieveConfig';

export const commandsHandler = async (
  client: Client,
  message: Message,
  db: Database | null
) => {
  if (message.author.bot) return null;

  const guildId = message.guildId as string;

  const { prefix, preferredChannel } = (await retrieveConfig(db, guildId)) as {
    prefix: string;
    preferredChannel: string;
  };

  // This is to prevent the bot from interacting with other bots and other prefixes or no prefixes
  if (!message.content.startsWith(prefix)) {
    return null;
  }

  // This will separate the message command and his arguments
  const noExtraSpaces = message.content.replace(/\s+/g, ' ').trim();
  const commandBody = noExtraSpaces.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift()?.toLowerCase() as string;

  if (
    command !== 'channel' &&
    preferredChannel &&
    message.channelId !== preferredChannel
  ) {
    return null;
  }

  // Here we will use the command as a key to return the correct response for each command
  try {
    return commands[command](client, message, args, db);
  } catch {
    return null;
  }
};
