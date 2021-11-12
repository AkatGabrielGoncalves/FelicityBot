import { Message, MessageEmbed } from 'discord.js';
import { QueueItem } from '../interfaces/QueueItem';
import { addTime } from './timeHelpers/addTime';
import { formatTime } from './timeHelpers/formatTime';

export const playingEmbed = (message: Message, currentlyPlaying: QueueItem) => {
  const { guild } = message;

  const time = addTime(currentlyPlaying, { hour: 0, minute: 0, second: 0 });
  const currentlyPlayingTime = formatTime(time);

  const { title, thumbnail, url } = currentlyPlaying;

  return new MessageEmbed()
    .setTitle(title)
    .setURL(url)
    .setAuthor(
      `Tocando agora em: ${guild?.name}` || '',
      guild?.iconURL() || undefined
    )
    .setThumbnail(thumbnail)
    .addFields({
      name: 'Duração',
      value: currentlyPlayingTime,
      inline: true,
    })
    .setTimestamp()
    .setFooter(guild?.name || '', guild?.iconURL() || undefined);
};
