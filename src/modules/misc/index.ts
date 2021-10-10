import { verifyPermissions } from '../helpers/verifyPermissions';
import handleChannel from './commands/channel';
import handlePrefix from './commands/prefix';

export const miscCommands: { [key: string]: Function } = {
  prefix: verifyPermissions(handlePrefix.execute, ['ADMINISTRATOR']),
  channel: verifyPermissions(handleChannel.execute, ['ADMINISTRATOR']),
};
