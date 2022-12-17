import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import { connections } from '../MusicPlayer';

class HandleNext implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Music';
    this.command = 'next';
    this.alias = ['skip'];
    this.description = `toca a proxima música do Bot.`;
    this.usage = ['next'];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SendMessages', 'Connect', 'Speak'],
    };
    this.userPermissions = { atLeastOne: [], mustHave: [] };
  }

  execute = async ({ message }: IExecuteParameters) => {
    if (!connections[`${message.guildId}`]) {
      return message.reply(`Não há player de música nesse servidor!`);
    }

    const conn = connections[`${message.guildId}`];

    return conn.next(message);
  };
}

export default new HandleNext();
