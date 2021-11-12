import { adminCommandHandlers } from './admin';
import ICommand from './interfaces/ICommand';
import { miscCommandHandlers } from './misc';
import { musicCommandHandlers } from './music';
import { permissionsHandler } from './permissionsHandler';

// All command handlers should be listed here from the modules
export const commandsHandlers: ICommand[] = [
  ...adminCommandHandlers,
  ...miscCommandHandlers,
  ...musicCommandHandlers,
];

export const mapCommands = () => {
  const commandMap: Map<String, Function> = new Map();
  commandsHandlers.forEach((handler) => {
    if (commandMap.has(handler.command))
      throw new Error(
        `There are multiple commands with the same name or alias. Alias or command that gave the error: ${handler.command}`
      );

    commandMap.set(
      handler.command,
      permissionsHandler(
        handler.execute,
        handler.userPermissions,
        handler.botPermissions
      )
    );
    // Set command alias
    handler.alias.forEach((alias) => {
      if (commandMap.has(alias))
        throw new Error(
          `There are multiple commands with the same name or alias. Alias or command that gave the error: ${alias}`
        );

      commandMap.set(
        alias,
        permissionsHandler(
          handler.execute,
          handler.userPermissions,
          handler.botPermissions
        )
      );
    });
  });
  return commandMap;
};
