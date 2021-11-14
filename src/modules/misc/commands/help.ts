import {
  IPermissions,
  ICommand,
  IExecuteParameters,
} from '../../../interfaces/customInterfaces';
import { defaultEmbed, specificEmbed } from './embeds/helpEmbed';

class HandleHelp implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Misc';
    this.command = 'help';
    this.alias = [];
    this.description = `Esse comando mostra todos os comandos para cada seção ou mais informações de outros comandos.`;
    this.usage = ['help', 'help play'];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SEND_MESSAGES'],
    };
    this.userPermissions = { atLeastOne: [], mustHave: [] };
  }

  execute = async ({ client, message, args }: IExecuteParameters) => {
    const argsExist = args.join('');

    if (!argsExist) {
      return message.reply({ embeds: [defaultEmbed(client)] });
    }

    const command = args[0].toLowerCase();

    if (!client.commandsMap.commandMap.has(command.toLowerCase()))
      return message.reply('Não existe esse comando viu!');

    return message.reply({ embeds: [specificEmbed(client, command.toLowerCase())] });
  };
}

export default new HandleHelp();
