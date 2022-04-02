import { Message } from 'discord.js';
import { getChannelAuths } from '../database/queries/channelAuth';
import { getServer } from '../database/queries/server';
import Logger from '../logger/Logger';
import { CommandPermissionsHandler } from './CommandPermissionsHandler';

export class CommandHandler extends CommandPermissionsHandler {
  private readonly __getPrefix = async (guildId: string) =>
    this.client.serverCache.get(guildId) || (await getServer(this.client, guildId));

  private readonly __getCommandAndArgs = (message: Message, prefix: string): [string, string[]] => {
    const noExtraSpaces = message.content.replace(/\s+/g, ' ').trim();
    const commandBody = noExtraSpaces.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift()?.toLowerCase() as string;

    return [command, args];
  };

  private readonly __checkChannel = async (message: Message, guildId: string) => {
    if (!message.member?.permissions.has('ADMINISTRATOR')) {
      const channels = await getChannelAuths(guildId);

      let authorized = false;

      if (!channels[0]) {
        authorized = true;
      } else {
        channels.forEach((channel) => {
          if (channel.id === message.channel.id && channel.type === 'permitted') {
            authorized = true;
          }
        });
      }
      return authorized;
    }
    return true;
  };

  private readonly __executeCommand = (message: Message, command: string, args: string[]) => {
    if (this.client.commandsMap.has(command)) {
      Logger.log('INFO', `Executing ${command}.`, new Error());
      return this.checkHandlerPermissions(message, args, this.client.commandsMap.get(command)!);
    }
    return null;
  };

  public readonly main = async (message: Message) => {
    if (message.author.bot) return null;

    const guildId = message.guildId as string;

    const prefix = await this.__getPrefix(guildId);

    if (!message.content.startsWith(prefix)) return null;

    const [command, args] = this.__getCommandAndArgs(message, prefix);

    const authorized = await this.__checkChannel(message, guildId);

    if (!authorized) return null;

    return this.__executeCommand(message, command, args);
  };
}
