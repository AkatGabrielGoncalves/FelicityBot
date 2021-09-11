import { Message, MessageEmbed } from 'discord.js';
import { QueueItem } from '../interfaces/QueueItem';
import { addTime } from './helpers/addTime';

export const addToQueueEmbed = (
  message: Message,
  currentlyPlaying: QueueItem,
  songAddedToPlaylist: QueueItem,
  queue: QueueItem[]
) => {
  const { guild } = message;

  let time = {
    hour: 0,
    minute: 0,
    second: 0,
  };

  // duration currently playing
  if (currentlyPlaying) {
    time = addTime(currentlyPlaying, time);
  }

  queue.forEach((song) => {
    time = addTime(song, time);
  });

  if (time.second > 60) {
    time.minute += Math.floor(time.second / 60);
    time.second %= 60;
  }
  if (time.minute > 60) {
    time.hour += Math.floor(time.minute / 60);
    time.minute %= 60;
  }

  return new MessageEmbed()
    .setTitle(songAddedToPlaylist.title)
    .setURL(songAddedToPlaylist.url)
    .setAuthor(
      `Adicionado a fila em: ${guild?.name}` || '',
      guild?.iconURL() || undefined
    )
    .setThumbnail(songAddedToPlaylist.thumbnail)
    .addFields(
      { name: 'Duração', value: songAddedToPlaylist.duration, inline: true },
      {
        name: 'Tempo até tocar',
        value: `${time.hour < 10 ? `0${time.hour}` : time.hour}:${
          time.minute < 10 ? `0${time.minute}` : time.minute
        }:${time.second < 10 ? `0${time.second}` : time.second}`,
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter(guild?.name || '', guild?.iconURL() || undefined);
};
