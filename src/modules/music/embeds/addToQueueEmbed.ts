import { Message, MessageEmbed } from 'discord.js';
import { Item as YouTubePlaylistResultItem } from 'ytpl';
import { YouTubeResultItem } from '../interfaces/YoutubeResultItem';

export const addToQueueEmbed = (
  message: Message,
  songToPlaylist: YouTubeResultItem,
  queue: (YouTubeResultItem | YouTubePlaylistResultItem)[]
) => {
  const { guild } = message;
  let minute = 0;
  let second = 0;

  const durationCurrentlyPlaying = songToPlaylist.duration.split(':');
  minute += Number(durationCurrentlyPlaying[0]);
  second += Number(durationCurrentlyPlaying[1]);

  queue.forEach((song) => {
    const duration = song.duration?.split(':');
    if (duration) {
      minute += Number(duration[0]);
      second += Number(duration[1]);
    }
  });

  minute += Number((second / 60).toFixed(0));
  second %= 60;

  return new MessageEmbed()
    .setTitle(songToPlaylist.title)
    .setURL(songToPlaylist.url)
    .setAuthor(
      `Adicionado a fila em: ${guild?.name}` || '',
      guild?.iconURL() || undefined
    )
    .addFields(
      { name: 'Duração', value: songToPlaylist.duration, inline: true },
      { name: 'Tempo até tocar', value: `${minute}:${second}`, inline: true }
    )
    .setTimestamp()
    .setFooter(guild?.name || '', guild?.iconURL() || undefined);
};
