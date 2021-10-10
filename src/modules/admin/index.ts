import { verifyPermissions } from '../helpers/verifyPermissions';
import handleBan from './commands/ban';
import handleKick from './commands/kick';
import handleUnban from './commands/unban';

// All admin commands needs to be added here like: 'command':handle'command'
export const adminCommands: { [key: string]: Function } = {
  ban: verifyPermissions(handleBan.execute, ['ADMINISTRATOR', 'BAN_MEMBERS']),
  kick: verifyPermissions(handleKick.execute, ['ADMINISTRATOR', 'KICK_MEMBERS']),
  unban: verifyPermissions(handleUnban.execute, ['ADMINISTRATOR', 'BAN_MEMBERS']),
};
