import { adminCommands } from './Admin/adminCommands';

// All commands should be listed here from the modules
export const commands: { [key: string]: Function } = {
  ...adminCommands,
};
