import { addChannelAuth, getChannelAuth } from '../../../database/queries/channelAuth';
import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import Logger from '../../../logger/Logger';
import { basicReply } from '../../../utils/basicReply';

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
        return basicReply(
          message,
          'Para usar esse comando tem que enviar um argumento! Ex: channel permitted',
          'info'
        );

      const possibleFirstArg = ['permitted', 'excluded', 'remove'];
      const firstArg = args[0].toLowerCase() as 'permitted' | 'excluded' | 'remove';

      if (!possibleFirstArg.includes(firstArg))
        return basicReply(message, `Seu argumento: ${firstArg} não é válido!  :(`, 'info');

      const guildId = message.guild?.id as string;

      if (args[1]) {
        const [, channelId] = args;

        if (!(await message.guild?.channels.fetch(channelId)))
          return basicReply(
            message,
            'O ID do canal informado no segundo argumento não é válido.',
            'info'
          );

        return await this.handler({ client, message, args }, channelId, guildId, firstArg);
      }

      const channelId = message.channel.id;

      return await this.handler({ client, message, args }, channelId, guildId, firstArg);
    } catch (err: any) {
      Logger.log('ERROR', `There was an error in channel command. arguments: ${args}`, err);
      return basicReply(message, 'Não foi possivel executar esse comando no momento...', 'error');
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
      return basicReply(message, 'Não existe esse canal para ser removido!!', 'info');
    }

    if (!channel) {
      await addChannelAuth(channelId, guildId, firstArg as 'permitted' | 'excluded');
      return basicReply(message, `Canal adicionado como ${firstArg}`, 'success');
    }

    if (channel.type !== firstArg) {
      await channel.update({
        type: firstArg as 'permitted' | 'excluded',
      });
      return basicReply(message, `Canal trocado de ${channel.type} para ${firstArg}`, 'success');
    }

    return basicReply(message, 'Configuração não foi alterada pois é a mesma!', 'success');
  };
}

export default new HandleChannel();
