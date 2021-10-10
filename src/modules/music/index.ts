import handleQueue from './commands/queue';
import handleNext from './commands/next';
import handlePause from './commands/pause';
import handlePlay from './commands/play';
import handleStop from './commands/stop';
import handleRemove from './commands/remove';
import handleLoop from './commands/loop';

export const musicCommands: { [key: string]: Function } = {
  play: handlePlay.execute,
  p: handlePlay.execute, // play alias
  stop: handleStop.execute,
  pause: handlePause.execute,
  next: handleNext.execute,
  queue: handleQueue.execute,
  remove: handleRemove.execute,
  loop: handleLoop.execute,
};
