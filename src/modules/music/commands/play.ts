import { AudioPlayerStatus } from '@discordjs/voice';
import { MusicPlayer, connections } from '../MusicPlayer';
import { retrieveUserAndAuthor } from '../../helpers/retrieveUserAndAuthor';
import {
  IPermissions,
  ICommand,
  IExecuteParameters,
} from '../../../interfaces/customInterfaces';

class HandlePlay implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Music';
    this.command = 'play';
    this.alias = ['p'];
    this.description = `Esse comando adiciona uma música para o bot tocar. Se a música estiver pausada, este comando também resume a música.`;
    this.usage = [
      'play //somente p/ resumir',
      'play <YoutubeUrl>',
      'play <YoutubeSearch>',
      'p <YoutubeUrl>',
    ];
    this.botPermissions = {
      atLeastOne: [],
      mustHave: ['SEND_MESSAGES', 'CONNECT', 'SPEAK'],
    };
    this.userPermissions = { atLeastOne: [], mustHave: [] };
  }

  execute = async ({ client, message, args }: IExecuteParameters) => {
    const messages = await message.channel.messages.fetch();
    const lastMessageTime = messages.first(2)[1].createdTimestamp;
    const currentMessageTime = message.createdTimestamp;

    if (lastMessageTime) {
      const timeDifference = currentMessageTime - lastMessageTime;
      if (timeDifference < 2000) {
        return message.reply(`Muito rápido`);
      }
    }

    const { authorMember } = await retrieveUserAndAuthor(message);

    if (!authorMember?.voice.channel) {
      return await message.reply(`Você precisa estar em um canal de voz!`);
    }

    if (!connections[`${message.guildId}`] && !args.join('')) {
      return await message.reply(
        'Ta com vergonha? Tudo bem, pode guardar pra você a sua música.'
      );
    }

    if (!connections[`${message.guildId}`]) {
      connections[`${message.guildId}`] = new MusicPlayer(client, message);
    }

    const conn = connections[`${message.guildId}`];

    if (conn.GetPlayerStatus() !== AudioPlayerStatus.Paused && !args.join('')) {
      return await message.reply(
        'Ta com vergonha? Tudo bem, pode guardar pra você a sua música.'
      );
    }

    return conn.play(message, args);
  };
}

export default new HandlePlay();
