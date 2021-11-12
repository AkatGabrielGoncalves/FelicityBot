import { Client, Message } from 'discord.js';
import { retrieveConfig } from './config/retrieveConfig';

export const commandsHandler = async (
  client: Client,
  message: Message,
  commandsMap: Map<String, Function>
) => {
  if (message.author.bot) return null;

  const guildId = message.guildId as string;

  const { prefix, preferredChannel } = (await retrieveConfig(guildId)) as {
    prefix: string;
    preferredChannel: string;
  };

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

  if (commandsMap.has(command)) {
    return (commandsMap.get(command) as Function)({ client, message, args });
  }
  return null;
};
