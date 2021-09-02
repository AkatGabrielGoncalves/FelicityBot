import { Client, GuildMember, Message, User } from 'discord.js';
import { retrieveUserAndAuthor } from '../helpers/retrieveUserAndAuthor';

export const handleBan = async (
  client: Client,
  message: Message,
  args: string[] // args should be only an user
) => {
  if (!args[0]) return await message.reply('?');

  const { mentionUser, mentionMember, authorUser } = (await retrieveUserAndAuthor(
    message
  )) as {
    mentionUser: User | null;
    mentionMember: GuildMember | null;
    authorUser: User;
    authorMember: GuildMember;
  };

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
        await m.ban();
        return await message.channel.send(`Auf Wiedersehen, <@${m.id}>`);
      } catch (err) {
        return await message.reply(
          `Eu acho que... eu não consigo banir <@${m.id}>!`
        );
      }
    });
  }

  try {
    await mentionMember?.ban();
    return await message.channel.send(`Auf Wiedersehen, <@${mentionUser?.id}>`);
  } catch (err) {
    return mentionUser
      ? await message.reply(
          `Eu acho que... eu não consigo banir <@${mentionUser.id}>!`
        )
      : await message.reply(`Esse usuário não existe!`);
  }
};
