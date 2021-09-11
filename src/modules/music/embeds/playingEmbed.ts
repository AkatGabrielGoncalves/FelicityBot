import { Message, MessageEmbed } from 'discord.js';
import { QueueItem } from '../interfaces/QueueItem';
import { addTime } from './helpers/addTime';

export const playingEmbed = (message: Message, currentlyPlaying: QueueItem) => {
  const { guild } = message;

  const time = addTime(currentlyPlaying, { hour: 0, minute: 0, second: 0 });

  return new MessageEmbed()
    .setTitle(currentlyPlaying.title)
    .setURL(currentlyPlaying.url)
    .setAuthor(
      `Tocando agora em: ${guild?.name}` || '',
      guild?.iconURL() || undefined
    )
    .setThumbnail(currentlyPlaying.thumbnail)
    .addFields({
      name: 'Duração',
      value: `${time.hour < 10 ? `0${time.hour}` : time.hour}:${
        time.minute < 10 ? `0${time.minute}` : time.minute
      }:${time.second < 10 ? `0${time.second}` : time.second}`,
      inline: true,
    })
    .setTimestamp()
    .setFooter(guild?.name || '', guild?.iconURL() || undefined);
};
