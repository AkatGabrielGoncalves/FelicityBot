import { getUserAndAuthor } from '../../../utils/modules/commands/getUserAndAuthor';
import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';

class HandleKick implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Admin';
    this.command = 'kick';
    this.alias = [];
    this.description = 'Esse comando remove um usuário do servidor ou todos os usuários';
    this.usage = ['kick @user', 'kick @everyone'];
    this.botPermissions = {
      atLeastOne: ['ADMINISTRATOR', 'KICK_MEMBERS'],
      mustHave: ['SEND_MESSAGES'],
    };
    this.userPermissions = {
      atLeastOne: ['ADMINISTRATOR', 'KICK_MEMBERS'],
      mustHave: [],
    };
  }

  execute = async ({ client, message, args }: IExecuteParameters) => {
    if (!args[0]) return await message.reply('?');

    const { mentionUser, mentionMember, authorUser } = await getUserAndAuthor(message);

    if (!mentionUser || !mentionMember)
      return await message.reply('Por favor, um usuário válido, sim?');

    if (mentionUser && (mentionUser.id === client.user?.id || mentionUser.id === authorUser.id))
      return await message.reply('Haha boa tentativa.');

    if (message.mentions.everyone) {
      // This is a map so I can take the array to assert my tests.
      return Promise.all(
        (await message.guild?.members.fetch()!).map(async (m) => {
          try {
            await m.kick();
            return await message.channel.send(`Auf Wiedersehen, <@${m.id}>`);
          } catch (err) {
            return await message.reply(`Eu acho que... eu não consigo expulsar <@${m.id}>!`);
          }
        })
      );
    }

    try {
      await mentionMember.kick();
      return await message.channel.send(`Auf Wiedersehen, <@${mentionUser.id}>`);
    } catch (err) {
      return mentionUser
        ? await message.reply(`Eu acho que... eu não consigo expulsar <@${mentionUser.id}>!`)
        : await message.reply(`Esse usuário não existe!`);
    }
  };
}

export default new HandleKick();
