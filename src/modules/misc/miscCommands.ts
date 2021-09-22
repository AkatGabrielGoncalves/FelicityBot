import { verifyPermissions } from '../helpers/verifyPermissions';
import { handleChannel } from './channel';
import { handlePrefix } from './prefix';

export const miscCommands: { [key: string]: Function } = {
  prefix: verifyPermissions(handlePrefix, ['ADMINISTRATOR']),
  channel: verifyPermissions(handleChannel, ['ADMINISTRATOR']),
};
