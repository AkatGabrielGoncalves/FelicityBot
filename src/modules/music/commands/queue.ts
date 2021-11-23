import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import { connections } from '../MusicPlayer';

class HandleQueue implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Music';
    this.command = 'queue';
    this.alias = [];
    this.description = `Esse comando mostra a fila de músicas do Bot.`;
    this.usage = ['queue'];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SEND_MESSAGES', 'CONNECT', 'SPEAK', 'ADD_REACTIONS', 'EMBED_LINKS'],
    };
    this.userPermissions = { atLeastOne: [], mustHave: [] };
  }

  execute = async ({ client, message }: IExecuteParameters) => {
    if (!connections[`${message.guildId}`]) {
      return message.reply(`Não há player de música nesse servidor!`);
    }

    const conn = connections[`${message.guildId}`];

    return conn.showQueue(client, message);
  };
}

export default new HandleQueue();
