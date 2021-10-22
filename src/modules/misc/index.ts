import ICommand from '../interfaces/ICommand';
import handleChannel from './commands/channel';
import handlePrefix from './commands/prefix';

export const miscCommandHandlers: ICommand[] = [handlePrefix, handleChannel];
