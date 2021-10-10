import { Client, Message, PermissionResolvable } from 'discord.js';
import ICommand from '../../interfaces/ICommand';
import { connections } from '../MusicPlayer';

class HandlePause implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: PermissionResolvable[];

  userPermissions: PermissionResolvable[];

  constructor() {
    this.type = 'Music';
    this.command = 'pause';
    this.alias = [];
    this.description = `Esse comando pausa o bot de música.`;
    this.usage = ['pause'];
    this.botPermissions = [[], 'SEND_MESSAGES', 'CONNECT', 'SPEAK'];
    this.userPermissions = [[]];
  }

  execute = async (client: Client, message: Message) => {
    if (!connections[`${message.guildId}`]) {
      return message.reply(`Não há player de música nesse servidor!`);
    }

    const conn = connections[`${message.guildId}`];

    return conn.pause(message);
  };
}

export default new HandlePause();
