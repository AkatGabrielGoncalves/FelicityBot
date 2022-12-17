import { ICommand } from '../interfaces/customInterfaces';
import Logger from '../logger/Logger';
import { adminCommandHandlers } from './admin';
import { miscCommandHandlers } from './misc';
import { musicCommandHandlers } from './music';

// All command handlers should be listed here from the modules
const commandsHandlers: Record<string, ICommand[]> = {
  admin: adminCommandHandlers,
  misc: miscCommandHandlers,
  music: musicCommandHandlers,
};

export const mapCommands = () => {
  const commandsCategoriesMap: Map<String, ICommand[]> = new Map();
  const commandsMap: Map<String, ICommand> = new Map();
  Logger.debug('Mapping all commands and aliases.');
  Object.keys(commandsHandlers).forEach((category) => {
    commandsCategoriesMap.set(category, commandsHandlers[category]);
    commandsHandlers[category].forEach((handler) => {
      if (commandsMap.has(handler.command))
        throw new Error(
          `There are multiple commands with the same name or alias. Alias or command that gave the error: ${handler.command}`
        );

      commandsMap.set(handler.command, handler);
      // Set command alias
      handler.alias.forEach((alias) => {
        if (commandsMap.has(alias))
          throw new Error(
            `There are multiple commands with the same name or alias. Alias or command that gave the error: ${alias}`
          );

        commandsMap.set(alias, handler);
      });
    });
  });
  Logger.debug('Finished mapping all commands and aliases.');
  return {
    commandsMap,
    commandsCategoriesMap,
  };
};
