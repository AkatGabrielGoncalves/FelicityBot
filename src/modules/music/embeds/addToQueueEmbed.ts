import { Message, MessageEmbed } from 'discord.js';
import { Item as YouTubePlaylistResultItem } from 'ytpl';
import { YouTubeResultItem } from '../interfaces/YoutubeResultItem';

export const addToQueueEmbed = (
  message: Message,
  songToPlaylist: YouTubeResultItem,
  queue: (YouTubeResultItem | YouTubePlaylistResultItem)[]
) => {
  const { guild } = message;
  let hour = 0;
  let minute = 0;
  let second = 0;

  // duration currently playing
  const durationCP = songToPlaylist.duration.split(':');
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
  console.log(`${hour}:${minute}:${second}`);
  if (second > 60) {
    minute += Math.floor(second / 60);
    second %= 60;
  }
  if (minute > 60) {
    hour += Math.floor(minute / 60);
    minute %= 60;
  }

  return new MessageEmbed()
    .setTitle(songToPlaylist.title)
    .setURL(songToPlaylist.url)
    .setAuthor(
      `Adicionado a fila em: ${guild?.name}` || '',
      guild?.iconURL() || undefined
    )
    .setThumbnail(songToPlaylist.bestThumbnail.url)
    .addFields(
      { name: 'Duração', value: songToPlaylist.duration, inline: true },
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
