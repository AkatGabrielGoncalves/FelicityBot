import { ApplicationCommandOption, ApplicationCommandOptionType } from 'discord.js';
import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import { basicReply } from '../../../utils/basicReply';

class HandleSearch implements ICommand {
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
    this.command = 'search';
    this.alias = [];
    this.description = `Pesquisa usando uma regex as últimas 100 mensagens e retorna o primeiro resultado.`;
    this.usage = ['search oi'];
    this.options = [
      {
        name: 'text',
        description: 'Texto para procurar',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SendMessages', 'ReadMessageHistory'],
    };
    this.userPermissions = { atLeastOne: [], mustHave: ['ReadMessageHistory'] };
  }

  execute = async ({ message, args }: IExecuteParameters) => {
    if (!args.join('')) {
      return basicReply(message, 'Eu preciso de uma regex pra fazer a busca! :(', 'info');
    }

    const regex = new RegExp(args[0]);

    const messages = await message.channel.messages.fetch({ limit: 100 });

    // @ts-ignore
    const foundMessage = messages.find((msg) => {
      if (message.id === msg.id) {
        return false;
      }
      return regex.test(msg.content);
    });

    if (!foundMessage) {
      return basicReply(message, 'Não encontrei nada :(', 'info');
    }
    return basicReply(message, `Encontrei uma mensagem! aqui: ${foundMessage.url}`, 'success');
  };
}

export default new HandleSearch();
