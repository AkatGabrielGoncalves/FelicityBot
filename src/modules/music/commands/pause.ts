import {
  IPermissions,
  ICommand,
  IExecuteParameters,
} from '../../../interfaces/customInterfaces';
import { connections } from '../MusicPlayer';

class HandlePause implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Music';
    this.command = 'pause';
    this.alias = [];
    this.description = `Esse comando pausa o bot de música.`;
    this.usage = ['pause'];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SEND_MESSAGES', 'CONNECT', 'SPEAK'],
    };
    this.userPermissions = { atLeastOne: [], mustHave: [] };
  }

  execute = async ({ message }: IExecuteParameters) => {
    if (!connections[`${message.guildId}`]) {
      return message.reply(`Não há player de música nesse servidor!`);
    }

    const conn = connections[`${message.guildId}`];

    return conn.pause(message);
  };
}

export default new HandlePause();
