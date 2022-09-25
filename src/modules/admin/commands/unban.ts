import { ApplicationCommandOption, ApplicationCommandOptionType } from 'discord.js';
import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
import { basicReply } from '../../../utils/basicReply';

// This is the function that will ban an member
class HandleUnban implements ICommand {
  type: string;

  command: string;

  alias: string[];

  description: string;

  usage: string[];

  botPermissions: IPermissions;

  userPermissions: IPermissions;

  options: ApplicationCommandOption[];

  constructor() {
    this.type = 'Admin';
    this.command = 'unban';
    this.alias = [];
    this.description = 'retira o ban de um usuário ou todos os usuários';
    this.usage = ['unban @user', 'unban @everyone'];
    this.options = [
      {
        name: 'user',
        description: 'Usuario',
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
    ];
    this.botPermissions = {
      atLeastOne: ['Administrator', 'BanMembers'],
      mustHave: ['SendMessages'],
    };
    this.userPermissions = {
      atLeastOne: ['Administrator', 'BanMembers'],
      mustHave: [],
    };
  }

  execute = async ({ message, args }: IExecuteParameters) => {
    if (!args[0]) return basicReply(message, '?', 'info');

    const bans = await message.guild?.bans.fetch();

    if (!bans) return basicReply(message, 'Não tem ninguém banido aqui!!', 'info');

    if (message.mentions.everyone) {
      // This is a map so I can take the array to assert my tests.
      return Promise.all(
        bans.map(async (ban) => {
          try {
            await message.guild?.members.unban(ban.user);
            return await message.channel.send(`O <@${ban.user.id}> está desbanido!`);
          } catch (err) {
            return await message.reply(`Não consegui desbanir esse usuário!`);
          }
        })
      );
    }

    const bannedUser = bans.find((ban) => ban.user.id === args[0]);
    if (!bannedUser)
      return basicReply(message, `Não existe nenhum usuário banido com esse ID!`, 'info');

    try {
      await message.guild?.members.unban(bannedUser.user);
      return basicReply(message, `O <@${bannedUser.user.id}> está desbanido!`, 'success');
    } catch (err) {
      return basicReply(message, `Não consegui desbanir esse usuário!`, 'error');
    }
  };
}

export default new HandleUnban();
