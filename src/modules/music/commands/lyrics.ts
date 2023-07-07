import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import { connections } from '../MusicPlayer';

class HandleLyrics implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Music';
    this.command = 'lyrics';
    this.alias = [];
    this.description = `Esse comando mostra as letras da música que está tocando atualmente`;
    this.usage = ['lyrics'];
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

    return conn.lyrics(message);
  };
}

export default new HandleLyrics();
