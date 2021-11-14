import handleQueue from './commands/queue';
import handleNext from './commands/next';
import handlePause from './commands/pause';
import handlePlay from './commands/play';
import handleStop from './commands/stop';
import handleRemove from './commands/remove';
import handleLoop from './commands/loop';
import { ICommand } from '../../interfaces/customInterfaces';

export const musicCommandHandlers: ICommand[] = [
  handlePlay,
  handleStop,
  handlePause,
  handleNext,
  handleQueue,
  handleRemove,
  handleLoop,
];
