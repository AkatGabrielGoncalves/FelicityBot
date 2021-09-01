import { handlePrefix } from './prefix';

export const miscCommands: { [key: string]: Function } = {
  prefix: handlePrefix,
};
