import { Message, MessageEmbed } from 'discord.js';
import { queueItem } from '../interfaces/queueItem';

export const playingEmbed = (message: Message, currentlyPlaying: queueItem) => {
  const { guild } = message;

  return new MessageEmbed()
    .setTitle(currentlyPlaying.title)
    .setURL(currentlyPlaying.url)
    .setAuthor(
      `Tocando agora em: ${guild?.name}` || '',
      guild?.iconURL() || undefined
    )
    .setThumbnail(currentlyPlaying.thumbnail)
    .addFields({ name: 'Duração', value: currentlyPlaying.duration, inline: true })
    .setTimestamp()
    .setFooter(guild?.name || '', guild?.iconURL() || undefined);
};
