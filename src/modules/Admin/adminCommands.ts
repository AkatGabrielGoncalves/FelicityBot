import { handleBan } from './ban';
import { handleKick } from './kick';
import { handleUnban } from './unban';

// All admin commands needs to be added here like: 'command':handle'command'
export const adminCommands: { [key: string]: Function } = {
  ban: handleBan,
  kick: handleKick,
  unban: handleUnban,
};
