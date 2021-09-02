import { Client, Message } from 'discord.js';
import { retrieveUserAndAuthor } from '../helpers/retrieveUserAndAuthor';

export const handleKick = async (
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
