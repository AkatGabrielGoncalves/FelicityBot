import { Message, EmbedBuilder as MessageEmbed } from 'discord.js';
import { QueueItem } from '../interfaces/QueueItem';
import { addTime, ITime } from './timeHelpers/addTime';
import { formatTime } from './timeHelpers/formatTime';

export const addToQueueEmbed = (
  message: Message,
  currentlyPlaying: QueueItem,
  songAddedToPlaylist: QueueItem,
  queue: QueueItem[]
) => {
  const { guild } = message;

  const songAddedToPlaylistTime = formatTime(
    addTime(currentlyPlaying, {
      hour: 0,
      minute: 0,
      second: 0,
    })
  );

  let tempTime: ITime = {
    hour: 0,
    minute: 0,
    second: 0,
  };

  // duration currently playing
  if (currentlyPlaying) {
    tempTime = addTime(currentlyPlaying, tempTime);
  }

  queue.forEach((song) => {
    tempTime = addTime(song, tempTime);
  });

  const playingAndQueueTime = formatTime(tempTime);

  const { title, thumbnail, url } = songAddedToPlaylist;

  return new MessageEmbed()
    .setTitle(title)
    .setURL(url)
    .setAuthor({
      name: `Adicionado a fila em: ${guild?.name}`,
      iconURL: guild?.iconURL() || undefined,
    })
    .setThumbnail(thumbnail)
    .addFields(
      { name: 'Duração', value: songAddedToPlaylistTime, inline: true },
      {
        name: 'Tempo até tocar',
        value: playingAndQueueTime,
        inline: true,
      }
    );
};
