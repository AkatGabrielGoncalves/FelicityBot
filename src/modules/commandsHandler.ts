import { Message } from 'discord.js';
import { ICustomClient } from '../interfaces/customInterfaces';
import logger from '../logger/Logger';
import { retrieveConfig } from './config/retrieveConfig';

export const commandsHandler = async (client: ICustomClient, message: Message) => {
  try {
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

    if (command !== 'channel' && preferredChannel && message.channelId !== preferredChannel) {
      return null;
    }

    if (client.commandsMap.commandMap.has(command)) {
      logger.log('INFO', `Executing ${command}.`, new Error());
      return (client.commandsMap.commandMap.get(command)?.execute as Function)({
        client,
        message,
        args,
      });
    }
    return null;
  } catch (err: any) {
    logger.log('ERROR', 'There was an error trying execute the command', new Error(err));

    return null;
  }
};
