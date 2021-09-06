import { Message, MessageEmbed } from 'discord.js';
import { YouTubeResultItem } from '../interfaces/YoutubeResultItem';

export const playingEmbed = (
  message: Message,
  currentlyPlaying: YouTubeResultItem
) => {
  const { guild } = message;

  return new MessageEmbed()
    .setTitle(currentlyPlaying.title)
    .setURL(currentlyPlaying.url)
    .setAuthor(
      `Tocando agora em: ${guild?.name}` || '',
      guild?.iconURL() || undefined
    )
    .setThumbnail(currentlyPlaying.bestThumbnail.url)
    .addFields({ name: 'Duração', value: currentlyPlaying.duration, inline: true })
    .setTimestamp()
    .setFooter(guild?.name || '', guild?.iconURL() || undefined);
};
