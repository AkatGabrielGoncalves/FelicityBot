import { adminCommands } from './Admin/adminCommands';
import { miscCommands } from './misc/miscCommands';
import { musicCommands } from './music/musicCommands';

// All commands should be listed here from the modules
export const commands: { [key: string]: Function } = {
  ...adminCommands,
  ...miscCommands,
  ...musicCommands,
};
