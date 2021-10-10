import { Client, Message, PermissionResolvable } from 'discord.js';
import ICommand from '../../interfaces/ICommand';

// This is the function that will ban an member
class HandleUnban implements ICommand {
  type: string;

  command: string;

  alias: never[];

  description: string;

  usage: string[];

  botPermissions: PermissionResolvable[];

  userPermissions: PermissionResolvable[];

  constructor() {
    this.type = 'Admin';
    this.command = 'unban';
    this.alias = [];
    this.description =
      'Esse comando retira o ban de um usuário ou todos os usuários';
    this.usage = ['unban @user', 'unban @everyone'];
    this.botPermissions = [['ADMINISTRATOR', 'BAN_MEMBERS'], 'SEND_MESSAGES'];
    this.userPermissions = [['ADMINISTRATOR', 'BAN_MEMBERS']];
  }

  execute = async (
    client: Client,
    message: Message,
    args: string[] // args should be only an user
  ) => {
    if (!args[0]) return await message.reply('?');

    const bans = await message.guild?.bans.fetch();

    if (!bans) return await message.reply('Não tem ninguém banido aqui!!');

    if (message.mentions.everyone) {
      return bans.forEach(async (ban) => {
        try {
          await message.guild?.members.unban(ban.user);
          return await message.channel.send(`O <@${ban.user.id}> está desbanido!`);
        } catch (err) {
          return await message.reply(`Não consegui desbanir esse usuário!`);
        }
      });
    }

    const bannedUser = bans.find((ban) => ban.user.id === args[0]);
    if (!bannedUser)
      return message.reply(`Não existe nenhum usuário banido com esse ID!`);

    try {
      await message.guild?.members.unban(bannedUser.user);
      return await message.channel.send(
        `O <@${bannedUser.user.id}> está desbanido!`
      );
    } catch (err) {
      return await message.reply(`Não consegui desbanir esse usuário!`);
    }
  };
}

export default new HandleUnban();
