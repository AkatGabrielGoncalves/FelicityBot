import { ApplicationCommandOption, ApplicationCommandOptionType } from 'discord.js';
import { setServer } from '../../../database/queries/server';
import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import { basicReply } from '../../../utils/basicReply';

class HandlePrefix implements ICommand {
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
    this.command = 'prefix';
    this.alias = [];
    this.description = `muda o prefixo para este servidor. Padrão '!'.`;
    this.usage = ['prefix @', 'prefix !', 'prefix !t'];
    this.options = [
      {
        name: 'prefix',
        description: 'Novo prefixo',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SendMessages'],
    };
    this.userPermissions = { atLeastOne: ['Administrator'], mustHave: [] };
  }

  execute = async ({ client, message, args }: IExecuteParameters) => {
    const arg = args.join('');
    if (!arg || arg.length < 0 || arg.length > 2)
      return basicReply(
        message,
        'Alguma coisa tem que ser meu prefixo! São só um ou dois caracteres!',
        'info'
      );

    try {
      await setServer(client, message.guild?.id as string, arg);

      return basicReply(message, `Prefixo trocado para: ${arg}`, 'success');
    } catch (err) {
      return basicReply(message, 'Não foi possivel mudar o prefixo :(', 'error');
    }
  };
}

export default new HandlePrefix();
