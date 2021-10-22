import { Client, Message, PermissionResolvable } from 'discord.js';
import ICommand from '../../interfaces/ICommand';
import { connections } from '../MusicPlayer';

class HandleNext implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: {
    atLeastOne: PermissionResolvable[];
    mustHave: PermissionResolvable[];
  };

  userPermissions: {
    atLeastOne: PermissionResolvable[];
    mustHave: PermissionResolvable[];
  };

  constructor() {
    this.type = 'Music';
    this.command = 'next';
    this.alias = ['skip'];
    this.description = `Esse comando toca a proxima música do Bot.`;
    this.usage = ['next'];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SEND_MESSAGES', 'CONNECT', 'SPEAK'],
    };
    this.userPermissions = { atLeastOne: [], mustHave: [] };
  }

  execute = async (client: Client, message: Message) => {
    if (!connections[`${message.guildId}`]) {
      return message.reply(`Não há player de música nesse servidor!`);
    }

    const conn = connections[`${message.guildId}`];

    return conn.next(message);
  };
}

export default new HandleNext();
