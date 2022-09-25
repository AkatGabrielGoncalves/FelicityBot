import { ApplicationCommandOption, ApplicationCommandOptionType } from 'discord.js';
import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import { defaultEmbed, specificEmbed } from './embeds/helpEmbed';

class HandleHelp implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  options: ApplicationCommandOption[];

  constructor() {
    this.type = 'Misc';
    this.command = 'help';
    this.alias = [];
    this.description = `mostra todos os comandos para cada seção ou mais informações de outros comandos.`;
    this.usage = ['help', 'help play'];
    this.options = [
      {
        name: 'commandname',
        description: 'Nome do comando',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SendMessages'],
    };
    this.userPermissions = { atLeastOne: [], mustHave: [] };
  }

  execute = async ({ client, message, args }: IExecuteParameters) => {
    const argsExist = args.join('');

    if (!argsExist) {
      return message.reply({ embeds: [defaultEmbed(client)] });
    }

    const command = args[0].toLowerCase();

    if (!client.commandsMap.has(command)) return message.reply('Não existe esse comando viu!');

    return message.reply({ embeds: [specificEmbed(client, command.toLowerCase())] });
  };
}

export default new HandleHelp();
