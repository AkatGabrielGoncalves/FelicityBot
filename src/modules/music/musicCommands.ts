import { handleQueue } from './queue';
import { handleNext } from './next';
import { handlePause } from './pause';
import { handlePlay } from './play';
import { handleStop } from './stop';

export const musicCommands: { [key: string]: Function } = {
  play: handlePlay,
  p: handlePlay, // play alias
  stop: handleStop,
  pause: handlePause,
  next: handleNext,
  queue: handleQueue,
};
