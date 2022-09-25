import { Message, EmbedBuilder as MessageEmbed } from 'discord.js';
import { QueueItem } from '../interfaces/QueueItem';
import { addTime } from './timeHelpers/addTime';
import { formatTime } from './timeHelpers/formatTime';

export const createQueueEmbed = (
  message: Message,
  currentlyPlaying: QueueItem,
  queue: QueueItem[],
  page: number
) => {
  const { guild } = message;
  const subArray = queue.slice(page, page + 10);

  // Page is actually how many songs should you "jump" (OFFSET).
  const parsedSubArray = subArray
    .map(
      (song, index) =>
        `${index + 1 + page}: ${song.title} [${formatTime(
          addTime(song, { hour: 0, minute: 0, second: 0 })
        )}]\n`
    )
    .join('');

  return new MessageEmbed()
    .setTitle(currentlyPlaying.title)
    .setURL(currentlyPlaying.url)
    .setAuthor({
      name: `Tocando agora em: ${guild?.name}` || '',
      iconURL: guild?.iconURL() || undefined,
    })
    .setDescription(`${parsedSubArray}`);
};
