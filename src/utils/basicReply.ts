import { Message, MessageEmbed } from 'discord.js';
import { embedColors } from './embedColors';

export const basicReply = (
  message: Message,
  reply: string,
  colorType: 'error' | 'success' | 'info'
) => {
  const color = embedColors[colorType];

  const embed = new MessageEmbed()
    .setDescription(reply[0].toUpperCase() + reply.slice(1))
    .setColor(color);

  return message.reply({ embeds: [embed] });
};
