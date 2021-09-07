import { Message, MessageEmbed } from 'discord.js';
import { Item as YouTubePlaylistResultItem } from 'ytpl';
import { YouTubeResultItem } from '../interfaces/YoutubeResultItem';

export const createQueueEmbed = (
  message: Message,
  currentlyPlaying: YouTubeResultItem,
  queue: (YouTubeResultItem | YouTubePlaylistResultItem)[],
  page: number
) => {
  const { guild } = message;
  const subArray = queue.slice(page, page + 10);
  const parsedSubArray = subArray
    .map((song, index) => `${index + 1 + page}: ${song.title} [${song.duration}]\n`)
    .join('');

  return new MessageEmbed()
    .setTitle(currentlyPlaying.title)
    .setURL(currentlyPlaying.url)
    .setAuthor(
      `Tocando agora em: ${guild?.name}` || '',
      guild?.iconURL() || undefined
    )
    .setDescription(`${parsedSubArray}`)
    .setTimestamp()
    .setFooter(guild?.name || '', guild?.iconURL() || undefined);
};