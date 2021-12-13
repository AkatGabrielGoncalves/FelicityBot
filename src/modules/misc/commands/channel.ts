import BotConfig from '../../../database/models/Server';
import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';

class HandleChannel implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Misc';
    this.command = 'channel';
    this.alias = [];
    this.description = `Esse comando prende o bot ao canal que foi usado o comando,
ou seja, só responderá quando for chamado no canal especificado.
Realizar o comando 'channel default', retorna o bot ao comportamento padrão`;
    this.usage = ['channel', 'channel default'];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SEND_MESSAGES'],
    };
    this.userPermissions = { atLeastOne: ['ADMINISTRATOR'], mustHave: [] };
  }

  execute = async ({ message, args }: IExecuteParameters) => {
    const arg = args.join('');

    let preferredChannel = null;
    if (!arg) {
      preferredChannel = message.channelId;
    }

    if (arg === 'default') {
      preferredChannel = null;
    }

    try {
      await BotConfig.update(
        {
          preferredChannel,
        },
        {
          where: {
            id: message.guildId,
          },
        }
      );

      if (arg !== 'default') {
        return await message.reply(
          `Agora eu só irei responder nesse canal! Use o comando '!channel default' para remover este comportamento!`
        );
      }
      return await message.reply(`Agora eu tô prestando atenção em todos os chats!`);
    } catch (err) {
      return await message.reply('Não foi possivel me prender neste canal. :(');
    }
  };
}

export default new HandleChannel();
