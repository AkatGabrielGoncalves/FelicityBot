import { Client, GuildMember, Message, User } from 'discord.js';
import { verifyUserAndMember } from '../helpers/verifyUserAndMember';

// This is the function that will ban an member
export const handleBan = async (
  client: Client,
  message: Message,
  args: string[]
) => {
  // No arguments? what I am going to ban?
  if (!args[0]) return await message.reply('?');

  // We need the user and the member to add some checks
  const { user, member, author, authorMember } = (await verifyUserAndMember(
    message
  )) as {
    user: User;
    member: GuildMember;
    author: User;
    authorMember: GuildMember;
  };

  // So funny, our bot can't be banned by himself!! And the author cant ban himself... is he ok?

  if (user && (user.id === client.user?.id || user.id === author.id))
    return await message.reply('Haha boa tentativa.');

  // Well, our author can't ban everyone as he pleases right?
  if (
    !authorMember.permissions.has('ADMINISTRATOR') &&
    !authorMember.permissions.has('BAN_MEMBERS')
  )
    return await message.reply('Você não pode fazer isso amiguinho!');

  // NEW FEATURE: you can ban everyone!
  if (message.mentions.everyone && authorMember.permissions.has('ADMINISTRATOR')) {
    // @ts-ignore
    return (await message.guild?.members.fetch()).forEach(async (m) => {
      try {
        await m.ban();
        return await message.channel.send(`Auf Wiedersehen, <@${m.id}>`);
      } catch (err) {
        return await message.reply(
          `Eu acho que... eu não consigo banir <@${m.id}>!`
        );
      }
    });
  }

  // This executes our death sentence
  try {
    await member.ban();
    return await message.channel.send(`Auf Wiedersehen, <@${user.id}>`);
  } catch (err) {
    return await message.reply(`Eu acho que... eu não consigo banir <@${user.id}>!`);
  }
};
