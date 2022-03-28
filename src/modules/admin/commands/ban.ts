import { getUserAndAuthor } from '../../../utils/modules/commands/getUserAndAuthor';
import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import { basicReply } from '../../../utils/basicReply';

class HandleBan implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  constructor() {
    this.type = 'Admin';
    this.command = 'ban';
    this.alias = [];
    this.description = 'Esse comando bane um usuário do servidor ou todos os usuários';
    this.usage = ['ban @user', 'ban @everyone'];
    this.botPermissions = {
      atLeastOne: ['ADMINISTRATOR', 'BAN_MEMBERS'],
      mustHave: ['SEND_MESSAGES'],
    };
    this.userPermissions = {
      atLeastOne: ['ADMINISTRATOR', 'BAN_MEMBERS'],
      mustHave: [],
    };
  }

  execute = async ({ client, message, args }: IExecuteParameters) => {
    if (!args[0]) return basicReply(message, '?', 'info');

    const { mentionUser, mentionMember, authorUser } = await getUserAndAuthor(message);

    if (!mentionUser || !mentionMember)
      return basicReply(message, 'Por favor, um usuário válido, sim?', 'info');

    if (mentionUser && (mentionUser.id === client.user?.id || mentionUser.id === authorUser.id))
      return basicReply(message, 'Haha boa tentativa.', 'info');

    if (message.mentions.everyone) {
      // This is a map so I can take the array to assert my tests.
      return Promise.all(
        (await message.guild?.members.fetch()!).map(async (m) => {
          try {
            await m.ban();
            return await message.channel.send(`Auf Wiedersehen, <@${m.id}>`);
          } catch (err) {
            return await message.reply(`Eu acho que... eu não consigo banir <@${m.id}>!`);
          }
        })
      );
    }

    try {
      await mentionMember?.ban();
      return basicReply(message, `Auf Wiedersehen, <@${mentionUser?.id}>`, 'success');
    } catch (err) {
      return mentionUser
        ? basicReply(message, `Eu acho que... eu não consigo banir <@${mentionUser.id}>!`, 'error')
        : basicReply(message, `Esse usuário não existe!`, 'error');
    }
  };
}

export default new HandleBan();
