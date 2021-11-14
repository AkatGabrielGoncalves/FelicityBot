import { ICommand } from '../../interfaces/customInterfaces';
import handleChannel from './commands/channel';
import handlePrefix from './commands/prefix';
import HandleHelp from './commands/help';

export const miscCommandHandlers: ICommand[] = [
  handlePrefix,
  handleChannel,
  HandleHelp,
];
