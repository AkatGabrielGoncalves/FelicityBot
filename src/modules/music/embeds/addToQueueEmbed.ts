import { Message, MessageEmbed } from 'discord.js';
import { Item as YouTubePlaylistResultItem } from 'ytpl';
import { YouTubeResultItem } from '../interfaces/YoutubeResultItem';

export const addToQueueEmbed = (
  message: Message,
  currentlyPlaying: YouTubeResultItem,
  songAddedToPlaylist: YouTubeResultItem,
  queue: (YouTubeResultItem | YouTubePlaylistResultItem)[]
) => {
  const { guild } = message;
  let hour = 0;
  let minute = 0;
  let second = 0;

  // duration currently playing
  const durationCP = currentlyPlaying.duration.split(':');
  minute += Number(durationCP[durationCP.length - 2]);
  second += Number(durationCP[durationCP.length - 1]);
  if (durationCP.length === 3) {
    hour += Number(durationCP[durationCP.length - 3]);
  }

  queue.forEach((song) => {
    const duration = song.duration?.split(':');
    if (duration) {
      minute += Number(duration[duration.length - 2]);
      second += Number(duration[duration.length - 1]);
      if (duration.length === 3) {
        hour += Number(duration[duration.length - 3]);
      }
    }
  });

  if (second > 60) {
    minute += Math.floor(second / 60);
    second %= 60;
  }
  if (minute > 60) {
    hour += Math.floor(minute / 60);
    minute %= 60;
  }

  return new MessageEmbed()
    .setTitle(songAddedToPlaylist.title)
    .setURL(songAddedToPlaylist.url)
    .setAuthor(
      `Adicionado a fila em: ${guild?.name}` || '',
      guild?.iconURL() || undefined
    )
    .setThumbnail(songAddedToPlaylist.bestThumbnail.url)
    .addFields(
      { name: 'Duração', value: songAddedToPlaylist.duration, inline: true },
      {
        name: 'Tempo até tocar',
        value: `${hour < 10 ? `0${hour}` : hour}:${
          minute < 10 ? `0${minute}` : minute
        }:${second < 10 ? `0${second}` : second}`,
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter(guild?.name || '', guild?.iconURL() || undefined);
};
