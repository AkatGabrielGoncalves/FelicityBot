import {
  IPermissions,
  ICommand,
  IExecuteParameters,
} from '../../../interfaces/customInterfaces';

class HandleSearch implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Misc';
    this.command = 'search';
    this.alias = [];
    this.description = `Esse comando pesquisa usando uma regex as últimas 100 mensagens e retorna o primeiro resultado.`;
    this.usage = ['search oi'];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
    };
    this.userPermissions = { atLeastOne: [], mustHave: ['READ_MESSAGE_HISTORY'] };
  }

  execute = async ({ message, args }: IExecuteParameters) => {
    if (!args.join('')) {
      return message.reply('Eu preciso de uma regex pra fazer a busca! :(');
    }

    const regex = new RegExp(args[0]);

    const messages = await message.channel.messages.fetch({ limit: 100 });
    // eslint-disable-next-line consistent-return
    const foundMessage = messages.find((msg) => {
      if (message.id !== msg.id) {
        if (regex.test(msg.content)) {
          return true;
        }
        return false;
      }
      return false;
    });

    if (!foundMessage) {
      return message.reply('Não encontrei nada :(');
    }
    return message.reply(`Encontrei uma mensagem! aqui: ${foundMessage.url}`);
  };
}

export default new HandleSearch();
