import fs from 'fs';
import path from 'path';
import BotConfig from '../../../database/models/BotConfig';
import {
  IPermissions,
  ICommand,
  IExecuteParameters,
} from '../../../interfaces/customInterfaces';

class HandlePrefix implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Misc';
    this.command = 'prefix';
    this.alias = [];
    this.description = `Esse comando muda o prefixo para este servidor. Padrão '!'.`;
    this.usage = ['prefix @', 'prefix !', 'prefix !t'];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SEND_MESSAGES'],
    };
    this.userPermissions = { atLeastOne: ['ADMINISTRATOR'], mustHave: [] };
  }

  execute = async ({ message, args }: IExecuteParameters) => {
    const arg = args.join('');
    if (!arg || arg.length < 0 || arg.length > 2)
      return await message.reply(
        'Alguma coisa tem que ser meu prefixo! São só um ou dois caracteres!'
      );

    try {
      if (process.env.USESQLDB === 'TRUE') {
        await BotConfig.update(
          {
            prefix: arg,
          },
          {
            where: {
              id: message.guildId,
            },
          }
        );
      }

      if (process.env.USESQLDB !== 'TRUE') {
        const location = path.resolve(__dirname, '..', '..', 'database', 'db.json');

        const serverInfoJson = fs.readFileSync(location, 'utf8');

        const serverInfoObj = JSON.parse(serverInfoJson) as {
          [key: string]: { prefix: string };
        };
        // eslint-disable-next-line prefer-destructuring
        serverInfoObj[`${message.guildId}`].prefix = arg;

        fs.writeFileSync(location, JSON.stringify(serverInfoObj), 'utf8');
      }

      return await message.reply(`Prefixo trocado para: ${arg}`);
    } catch (err) {
      return await message.reply('Não foi possivel mudar o prefixo :(');
    }
  };
}

export default new HandlePrefix();
