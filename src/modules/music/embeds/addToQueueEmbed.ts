import { Message, MessageEmbed } from 'discord.js';
import { QueueItem } from '../interfaces/QueueItem';
import { addTime } from './helpers/addTime';
import { formatTime } from './helpers/formatTime';

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

  const currentlyPlayingTime = formatTime(time);

  queue.forEach((song) => {
    time = addTime(song, time);
  });

  return new MessageEmbed()
    .setTitle(songAddedToPlaylist.title)
    .setURL(songAddedToPlaylist.url)
    .setAuthor(
      `Adicionado a fila em: ${guild?.name}` || '',
      guild?.iconURL() || undefined
    )
    .setThumbnail(songAddedToPlaylist.thumbnail)
    .addFields(
      { name: 'Duração', value: currentlyPlayingTime, inline: true },
      {
        name: 'Tempo até tocar',
        value: formatTime(time),
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter(guild?.name || '', guild?.iconURL() || undefined);
};
