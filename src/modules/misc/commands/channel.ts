import { addChannelAuth, getChannelAuth } from '../../../controllers/channelAuth';
import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import Logger from '../../../logger/Logger';

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
    this.usage = ['channel permitted', 'channel excluded', 'channel permitted {ChannelID}'];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SEND_MESSAGES'],
    };
    this.userPermissions = { atLeastOne: ['ADMINISTRATOR'], mustHave: [] };
  }

  execute = async ({ client, message, args }: IExecuteParameters) => {
    try {
      if (!args[0])
        return await message.reply(
          'Para usar esse comando tem que enviar um argumento! Ex: channel permitted'
        );

      const possibleFirstArg = ['permitted', 'excluded', 'remove'];
      const firstArg = args[0].toLowerCase() as 'permitted' | 'excluded' | 'remove';

      if (!possibleFirstArg.includes(firstArg))
        return await message.reply(`Seu argumento: ${firstArg} não é válido!  :(`);

      const guildId = message.guild?.id as string;

      if (args[1]) {
        const [, channelId] = args;

        if (!(await message.guild?.channels.fetch(channelId)))
          return await message.reply('O ID do canal informado no segundo argumento não é válido.');

        return await this.handler({ client, message, args }, channelId, guildId, firstArg);
      }

      const channelId = message.channel.id;

      return await this.handler({ client, message, args }, channelId, guildId, firstArg);
    } catch (err: any) {
      Logger.log(
        'ERROR',
        `There was an error in channel command. arguments: ${args}`,
        new Error(err)
      );
      return message.reply('Não foi possivel executar esse comando no momento...');
    }
  };

  private handler = async (
    { message }: IExecuteParameters,
    channelId: string,
    guildId: string,
    firstArg: 'permitted' | 'excluded' | 'remove'
  ) => {
    const channel = await getChannelAuth(channelId, guildId);

    if (firstArg === 'remove' && channel) {
      await channel.destroy();
    }
    if (firstArg === 'remove' && !channel) {
      return await message.reply('Não existe esse canal para ser removido!!');
    }

    if (!channel) {
      await addChannelAuth(channelId, guildId, firstArg as 'permitted' | 'excluded');
      return await message.reply(`Canal adicionado como ${firstArg}`);
    }

    if (channel.type !== firstArg) {
      await channel.update({
        type: firstArg as 'permitted' | 'excluded',
      });
      return await message.reply(`Canal trocado de ${channel.type} para ${firstArg}`);
    }

    return await message.reply('Configuração não foi alterada pois é a mesma!');
  };
}

export default new HandleChannel();
