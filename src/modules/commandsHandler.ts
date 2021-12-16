import { Message } from 'discord.js';
import { getChannelAuths } from '../controllers/channelAuth';
import { getServer } from '../controllers/server';
import { ICustomClient } from '../interfaces/customInterfaces';
import Logger from '../logger/Logger';

export const commandsHandler = async (client: ICustomClient, message: Message) => {
  try {
    if (message.author.bot) return null;

    const guildId = message.guildId as string;

    const prefix = client.serverCache.get(guildId) || (await getServer(client, guildId));

    if (!message.content.startsWith(prefix)) {
      return null;
    }

    // This will separate the message command and his arguments
    const noExtraSpaces = message.content.replace(/\s+/g, ' ').trim();
    const commandBody = noExtraSpaces.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift()?.toLowerCase() as string;

    if (!message.member?.permissions.has('ADMINISTRATOR')) {
      const channels = await getChannelAuths(guildId);

      let authorized = false;

      if (!channels[0]) {
        authorized = true;
      } else {
        channels.forEach((channel) => {
          if (String(channel.id) === message.channel.id && channel.type === 'permitted') {
            authorized = true;
          }
        });
      }

      if (!authorized) {
        return null;
      }
    }

    if (client.commandsMap.commandMap.has(command)) {
      Logger.log('INFO', `Executing ${command}.`, new Error());
      return (client.commandsMap.commandMap.get(command)?.execute as Function)({
        client,
        message,
        args,
      });
    }
    return null;
  } catch (err: any) {
    Logger.log('ERROR', 'There was an error trying execute the command', new Error(err));

    return null;
  }
};
