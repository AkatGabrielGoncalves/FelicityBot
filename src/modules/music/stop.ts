import { Client, Message } from 'discord.js';
import { connections } from './MusicPlayer';

export const handleStop = async (client: Client, message: Message) => {
  if (!connections[`${message.guildId}`]) {
    return message.reply(`Não há player de música nesse servidor!`);
  }

  const conn = connections[`${message.guildId}`];

  conn.stop(message);
  return delete connections[`${message.guildId}`];
};
