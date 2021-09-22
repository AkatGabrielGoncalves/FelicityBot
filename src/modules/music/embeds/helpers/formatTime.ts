interface ITime {
  hour: number;
  minute: number;
  second: number;
}

export const formatTime = (time: ITime) => {
  const tempTime = {
    ...time,
  };

  if (tempTime.second >= 60) {
    tempTime.minute += Math.floor(tempTime.second / 60);
    tempTime.second %= 60;
  }
  if (tempTime.minute >= 60) {
    tempTime.hour += Math.floor(tempTime.minute / 60);
    tempTime.minute %= 60;
  }

  return `${tempTime.hour < 10 ? `0${tempTime.hour}` : tempTime.hour}:${
    tempTime.minute < 10 ? `0${tempTime.minute}` : tempTime.minute
  }:${tempTime.second < 10 ? `0${tempTime.second}` : tempTime.second}`;
};
