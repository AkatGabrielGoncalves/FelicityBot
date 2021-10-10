import { adminCommands } from './admin';
import { miscCommands } from './misc';
import { musicCommands } from './music';

// All commands should be listed here from the modules
export const commands: { [key: string]: Function } = {
  ...adminCommands,
  ...miscCommands,
  ...musicCommands,
};
