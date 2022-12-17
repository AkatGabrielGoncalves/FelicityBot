import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import { connections } from '../MusicPlayer';

class HandleShuffle implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Music';
    this.command = 'shuffle';
    this.alias = [];
    this.description = `embaralha a fila de músicas.`;
    this.usage = ['shuffle'];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SendMessages'],
    };
    this.userPermissions = { atLeastOne: [], mustHave: [] };
  }

  execute = async ({ message }: IExecuteParameters) => {
    if (!connections[`${message.guildId}`]) {
      return message.reply(`Não há player de música nesse servidor!`);
    }

    const conn = connections[`${message.guildId}`];

    return conn.shuffleQueue(message);
  };
}

export default new HandleShuffle();
