import { Client, Message } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import { MusicPlayer, connections } from './MusicPlayer';
import { retrieveUserAndAuthor } from '../helpers/retrieveUserAndAuthor';

export const handlePlay = async (
  client: Client,
  message: Message,
  args: string[] // args should be an URL
) => {
  const messages = await message.channel.messages.fetch();
  const lastMessageTime = messages.first(2)[1].createdTimestamp;
  const currentMessageTime = message.createdTimestamp;

  if (lastMessageTime) {
    const timeDifference = currentMessageTime - lastMessageTime;
    if (timeDifference < 2000) {
      return message.reply(`Muito rápido`);
    }
  }

  const { authorMember } = await retrieveUserAndAuthor(message);

  if (!authorMember?.voice.channel) {
    return await message.reply(`Você precisa estar em um canal de voz!`);
  }

  if (!connections[`${message.guildId}`] && !args.join('')) {
    return await message.reply(
      'Ta com vergonha? Tudo bem, pode guardar pra você a sua música.'
    );
  }

  if (!connections[`${message.guildId}`]) {
    connections[`${message.guildId}`] = new MusicPlayer(client, message);
  }

  const conn = connections[`${message.guildId}`];

  if (conn.player.state.status !== AudioPlayerStatus.Paused && !args.join('')) {
    return await message.reply(
      'Ta com vergonha? Tudo bem, pode guardar pra você a sua música.'
    );
  }

  return conn.play(message, args);
};
