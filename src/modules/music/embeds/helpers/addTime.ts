import { QueueItem } from '../../interfaces/QueueItem';

interface Time {
  hour: number;
  minute: number;
  second: number;
}

export const addTime = (song: QueueItem, time: Time) => {
  const timeRegex =
    /([\d]+):([0-5]?[\d]):([0-5]?[\d])|([0-5]?[\d]):([0-5][\d])|([\d]+)/;

  const timeArray = song.duration.match(timeRegex);
  if (!timeArray) return time;
  const hour = time.hour + (Number(timeArray[1]) || 0);
  const minute = time.minute + (Number(timeArray[2]) || Number(timeArray[4]) || 0);
  const second =
    time.second +
    (Number(timeArray[3]) || Number(timeArray[5]) || Number(timeArray[6]) || 0);
  return {
    hour,
    minute,
    second,
  };
};
