import { Message, MessageEmbed } from 'discord.js';
import { Item as YouTubePlaylistResultItem } from 'ytpl';
import { YouTubeResultItem } from '../interfaces/YoutubeResultItem';

export const createQueueEmbed = (
  message: Message,
  currentlyPlaying: YouTubeResultItem,
  queue: (YouTubeResultItem | YouTubePlaylistResultItem)[]
) => {
  const { guild } = message;

  return new MessageEmbed()
    .setTitle(currentlyPlaying.title)
    .setURL(currentlyPlaying.url)
    .setAuthor(
      `Tocando agora em: ${guild?.name}` || '',
      guild?.iconURL() || undefined
    )
    .setDescription(
      `${queue
        .map((song, index) => `${index + 1}: ${song.title} [${song.duration}]\n`)
        .join('')}`
    )
    .setTimestamp()
    .setFooter(guild?.name || '', guild?.iconURL() || undefined);
};
