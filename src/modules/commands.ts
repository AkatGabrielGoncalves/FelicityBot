import { ICommand } from '../interfaces/customInterfaces';
import Logger from '../logger/Logger';
import { adminCommandHandlers } from './admin';
import { miscCommandHandlers } from './misc';
import { musicCommandHandlers } from './music';
import { permissionsHandler } from './permissionsHandler';

// All command handlers should be listed here from the modules
const commandsHandlers: Record<string, ICommand[]> = {
  admin: adminCommandHandlers,
  misc: miscCommandHandlers,
  music: musicCommandHandlers,
};

export const mapCommands = () => {
  const commandsCategoriesMap: Map<String, ICommand[]> = new Map();
  const commandsMap: Map<String, { handler: ICommand; execute: Function }> = new Map();
  Logger.start('mapcommands', 'DEBUG', 'Mapping all commands and aliases.', new Error());
  Object.keys(commandsHandlers).forEach((category) => {
    commandsCategoriesMap.set(category, commandsHandlers[category]);
    commandsHandlers[category].forEach((handler) => {
      if (commandsMap.has(handler.command))
        throw new Error(
          `There are multiple commands with the same name or alias. Alias or command that gave the error: ${handler.command}`
        );

      commandsMap.set(handler.command, {
        handler,
        execute: permissionsHandler(
          handler.execute,
          handler.userPermissions,
          handler.botPermissions
        ),
      });
      // Set command alias
      handler.alias.forEach((alias) => {
        if (commandsMap.has(alias))
          throw new Error(
            `There are multiple commands with the same name or alias. Alias or command that gave the error: ${alias}`
          );

        commandsMap.set(alias, {
          handler,
          execute: permissionsHandler(
            handler.execute,
            handler.userPermissions,
            handler.botPermissions
          ),
        });
      });
    });
  });
  Logger.finish('mapcommands', 'DEBUG', 'Finished mapping all commands and aliases.', new Error());
  return {
    commandsMap,
    commandsCategoriesMap,
  };
};
