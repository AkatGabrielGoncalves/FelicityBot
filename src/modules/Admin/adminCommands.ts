import { handleBan } from './ban';
import { handleKick } from './kick';

// All admin commands needs to be added here like: 'command':handle'command'
export const adminCommands: { [key: string]: Function } = {
  ban: handleBan,
  kick: handleKick,
};
