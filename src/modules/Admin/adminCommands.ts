import { verifyPermissions } from '../helpers/verifyPermissions';
import { handleBan } from './ban';
import { handleKick } from './kick';
import { handleUnban } from './unban';

// All admin commands needs to be added here like: 'command':handle'command'
export const adminCommands: { [key: string]: Function } = {
  ban: verifyPermissions(handleBan, ['ADMINISTRATOR', 'BAN_MEMBERS']),
  kick: verifyPermissions(handleKick, ['ADMINISTRATOR', 'KICK_MEMBERS']),
  unban: verifyPermissions(handleUnban, ['ADMINISTRATOR', 'BAN_MEMBERS']),
};
