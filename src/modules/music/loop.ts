import { Client, Message } from 'discord.js';
import { connections } from './MusicPlayer';

export const handleLoop = async (client: Client, message: Message) => {
  if (!connections[`${message.guildId}`]) {
    return message.reply(`Não há player de música nesse servidor!`);
  }

  const conn = connections[`${message.guildId}`];

  return conn.loop(message);
};