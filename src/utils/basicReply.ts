import { Message, EmbedBuilder as MessageEmbed, InteractionResponse } from 'discord.js';
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

  if (message instanceof InteractionResponse) {
    return message.interaction.channel?.send({ embeds: [embed] }) as unknown as Promise<
      Message<boolean>
    >;
  }

  return message.reply({ embeds: [embed] });
};
