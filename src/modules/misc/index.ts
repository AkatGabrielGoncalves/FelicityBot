import { ICommand } from '../../interfaces/customInterfaces';
import handleChannel from './commands/channel';
import handlePrefix from './commands/prefix';
import HandleHelp from './commands/help';
import HandleSearch from './commands/search';

export const miscCommandHandlers: ICommand[] = [
  handlePrefix,
  handleChannel,
  HandleHelp,
  HandleSearch,
];
