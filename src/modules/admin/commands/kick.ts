import { Client, Message, PermissionResolvable } from 'discord.js';
import { retrieveUserAndAuthor } from '../../helpers/retrieveUserAndAuthor';
import ICommand from '../../interfaces/ICommand';

class HandleKick implements ICommand {
  type: string;

  command: string;

  alias: never[];

  description: string;

  usage: string[];

  botPermissions: PermissionResolvable[];

  userPermissions: PermissionResolvable[];

  constructor() {
    this.type = 'Admin';
    this.command = 'kick';
    this.alias = [];
    this.description =
      'Esse comando remove um usuário do servidor ou todos os usuários';
    this.usage = ['kick @user', 'kick @everyone'];
    this.botPermissions = [['ADMINISTRATOR', 'KICK_MEMBERS'], 'SEND_MESSAGES'];
    this.userPermissions = [['ADMINISTRATOR', 'KICK_MEMBERS']];
  }

  execute = async (
    client: Client,
    message: Message,
    args: string[] // args should be only an user
  ) => {
    if (!args[0]) return await message.reply('?');

    const { mentionUser, mentionMember, authorUser } = await retrieveUserAndAuthor(
      message
    );

    if (!mentionUser || !mentionMember)
      return await message.reply('Por favor, um usuário válido, sim?');

    if (
      mentionUser &&
      (mentionUser.id === client.user?.id || mentionUser.id === authorUser.id)
    )
      return await message.reply('Haha boa tentativa.');

    if (message.mentions.everyone) {
      // @ts-ignore
      return (await message.guild?.members.fetch()).forEach(async (m) => {
        try {
          await m.kick();
          return await message.channel.send(`Auf Wiedersehen, <@${m.id}>`);
        } catch (err) {
          return await message.reply(
            `Eu acho que... eu não consigo expulsar <@${m.id}>!`
          );
        }
      });
    }

    try {
      await mentionMember.kick();
      return await message.channel.send(`Auf Wiedersehen, <@${mentionUser.id}>`);
    } catch (err) {
      return mentionUser
        ? await message.reply(
            `Eu acho que... eu não consigo expulsar <@${mentionUser.id}>!`
          )
        : await message.reply(`Esse usuário não existe!`);
    }
  };
}

export default new HandleKick();
