import ICommand from '../interfaces/ICommand';
import handleBan from './commands/ban';
import handleKick from './commands/kick';
import handleUnban from './commands/unban';

export const adminCommandHandlers: ICommand[] = [handleBan, handleKick, handleUnban];
