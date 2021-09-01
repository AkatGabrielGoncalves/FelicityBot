import { GuildMember, Message, User } from 'discord.js';
import { retrieveUserAndAuthor } from '../helpers/retrieveUserAndAuthor';

// This is the function that will ban an member
export const handleUnban = async (
  message: Message,
  args: string[] // args should be only an user
) => {
  if (!args[0]) return await message.reply('?');

  const { authorMember } = (await retrieveUserAndAuthor(message)) as {
    user: User;
    member: GuildMember;
    author: User;
    authorMember: GuildMember;
  };

  if (
    !authorMember.permissions.has('ADMINISTRATOR') &&
    !authorMember.permissions.has('BAN_MEMBERS')
  )
    return await message.reply('Você não pode fazer isso!');

  const bans = await message.guild?.bans.fetch();

  if (!bans) return await message.reply('Não tem ninguém banido aqui!!');

  if (message.mentions.everyone && authorMember.permissions.has('ADMINISTRATOR')) {
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
    return await message.channel.send(`O <@${bannedUser.user.id}> está desbanido!`);
  } catch (err) {
    return await message.reply(`Não consegui desbanir esse usuário!`);
  }
};
