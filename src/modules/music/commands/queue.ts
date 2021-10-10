import { Client, Message, PermissionResolvable } from 'discord.js';
import ICommand from '../../interfaces/ICommand';
import { connections } from '../MusicPlayer';

class HandleQueue implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: PermissionResolvable[];

  userPermissions: PermissionResolvable[];

  constructor() {
    this.type = 'Music';
    this.command = 'queue';
    this.alias = [];
    this.description = `Esse comando mostra a fila de músicas do Bot.`;
    this.usage = ['queue'];
    this.botPermissions = [
      [],
      'SEND_MESSAGES',
      'CONNECT',
      'SPEAK',
      'ADD_REACTIONS',
      'EMBED_LINKS',
    ];
    this.userPermissions = [[]];
  }

  execute = async (client: Client, message: Message) => {
    if (!connections[`${message.guildId}`]) {
      return message.reply(`Não há player de música nesse servidor!`);
    }

    const conn = connections[`${message.guildId}`];

    return conn.showQueue(client, message);
  };
}

export default new HandleQueue();
