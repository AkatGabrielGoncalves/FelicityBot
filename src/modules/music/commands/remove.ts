import ICommand from '../../interfaces/ICommand';
import IExecuteParameters from '../../interfaces/IExecuteParameters';
import IPermissions from '../../interfaces/IPermissions';
import { connections } from '../MusicPlayer';

class HandleRemove implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Music';
    this.command = 'remove';
    this.alias = [];
    this.description = `Esse comando remove uma música da fila do Bot.`;
    this.usage = ['remove <NúmeroDaMúsicaNaFila>'];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SEND_MESSAGES', 'CONNECT', 'SPEAK'],
    };
    this.userPermissions = { atLeastOne: [], mustHave: [] };
  }

  execute = async ({ message, args }: IExecuteParameters) => {
    if (!connections[`${message.guildId}`]) {
      return message.reply(`Não há player de música nesse servidor!`);
    }
    const indexToBeRemoved = args.join('');
    if (!indexToBeRemoved) {
      return message.reply(`É impossível remover o nada, tá bom?`);
    }

    if (Number.isNaN(Number(indexToBeRemoved))) {
      return message.reply(
        `O que é que você escreveu ai? "${indexToBeRemoved}" não é nem um número!`
      );
    }

    if (Number(indexToBeRemoved) < 1) {
      return message.reply(
        `Eu até podia remover usando números negativos... Mas removeram essa função minha. Um absurdo não?`
      );
    }

    const BinaryRegex = /^0b[0-1]+$/;
    const HexRegex = /^0x[\da-fA-F]+$/;

    if (BinaryRegex.exec(indexToBeRemoved)) {
      await message.reply(
        `\`\`\`00110000 00100000 01100101 00100000 00110001 00101100 00100000 01100011 01101111 01101110 01110011 01110100 01100001 01101110 01110100 01100101 01110011 00100000 01100001 01110010 01100010 01101001 01110100 01110010 11000011 10100001 01110010 01101001 01100001 01110011 00100000 01100011 01110010 01101001 01100001 01100100 01100001 01110011 00100000 01110000 01100101 01101100 01100001 00100000 01101000 01110101 01101101 01100001 01101110 01101001 01100100 01100001 01100100 01100101 00100000 01110000 01100001 01110010 01100001 00100000 01110010 01100101 01110000 01110010 01100101 01110011 01100101 01101110 01110100 01100001 01110010 00100000 01101111 00100000 01110110 01100101 01110010 01100100 01100001 01100100 01100101 01101001 01110010 01101111 00100000 01100101 00100000 01100110 01100001 01101100 01110011 01101111 00101110\`\`\``
      );
    }

    if (HexRegex.exec(indexToBeRemoved)) {
      await message.reply(
        `\`\`\`30 2c 31 2c 32 2c 33 2c 34 2c 35 2c 36 2c 37 2c 38 2c 39 20 61 74 e9 20 61 69 20 74 75 64 6f 20 62 65 6d 2e 2e 2e 20 6d 61 73 20 61 2c 62 2c 63 2c 64 2c 65 2c 66 20 3f 3f 3f 20 41 48 2c 20 70 6f 72 20 66 61 76 6f 72 20 6e e9 2e\`\`\``
      );
    }

    const conn = connections[`${message.guildId}`];

    return conn.remove(message, args);
  };
}

export default new HandleRemove();
