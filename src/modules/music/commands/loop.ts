import { Client, Message, PermissionResolvable } from 'discord.js';
import ICommand from '../../interfaces/ICommand';
import { connections } from '../MusicPlayer';

class HandleLoop implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: PermissionResolvable[];

  userPermissions: PermissionResolvable[];

  constructor() {
    this.type = 'Music';
    this.command = 'loop';
    this.alias = [];
    this.description = `Esse comando ativa o loop do Bot.`;
    this.usage = ['loop'];
    this.botPermissions = [[], 'SEND_MESSAGES', 'CONNECT', 'SPEAK'];
    this.userPermissions = [[]];
  }

  execute = async (client: Client, message: Message) => {
    if (!connections[`${message.guildId}`]) {
      return message.reply(`Não há player de música nesse servidor!`);
    }

    const conn = connections[`${message.guildId}`];

    return conn.loop(message);
  };
}

export default new HandleLoop();
