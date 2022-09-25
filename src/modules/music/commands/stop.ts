import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import { connections } from '../MusicPlayer';

class HandleStop implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Music';
    this.command = 'stop';
    this.alias = ['exit'];
    this.description = `para completamente o bot de música.`;
    this.usage = ['stop'];
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

    return conn.stop(message);
  };
}

export default new HandleStop();
