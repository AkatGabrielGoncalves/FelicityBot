import { Client, GuildMember, Message, User } from 'discord.js';
import { retrieveUserAndAuthor } from '../helpers/retrieveUserAndAuthor';

// This is the function that will kick an member
export const handleKick = async (
  client: Client,
  message: Message,
  args: string[] // args should be only an user
) => {
  // No arguments? what I am going to kick?
  if (!args[0]) return await message.reply('?');

  // We need the user and the member to add some checks
  const { user, member, author, authorMember } = (await retrieveUserAndAuthor(
    message
  )) as {
    user: User;
    member: GuildMember;
    author: User;
    authorMember: GuildMember;
  };

  // So funny, our bot can't be kicked by himself!! And the author cant kick himself... is he ok?

  if (user && (user.id === client.user?.id || user.id === author.id))
    return await message.reply('Haha boa tentativa.');

  // Well, our author can't kick if he doesnt have permission
  if (
    !authorMember.permissions.has('ADMINISTRATOR') &&
    !authorMember.permissions.has('KICK_MEMBERS')
  )
    return await message.reply('Você não pode fazer isso!');

  // NEW FEATURE: you can kick everyone!
  if (message.mentions.everyone && authorMember.permissions.has('ADMINISTRATOR')) {
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

  // This executes our death sentence
  try {
    await member.kick();
    return await message.channel.send(`Auf Wiedersehen, <@${user.id}>`);
  } catch (err) {
    return user
      ? await message.reply(`Eu acho que... eu não consigo expulsar <@${user.id}>!`)
      : await message.reply(`Esse usuário não existe!`);
  }
};
