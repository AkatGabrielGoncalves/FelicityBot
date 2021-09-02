import { verifyPermissions } from '../helpers/verifyPermissions';
import { handlePrefix } from './prefix';

export const miscCommands: { [key: string]: Function } = {
  prefix: verifyPermissions(handlePrefix, ['ADMINISTRATOR']),
};
