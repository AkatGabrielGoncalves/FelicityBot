import { adminCommandHandlers } from './admin';
import ICommand from './interfaces/ICommand';
import { miscCommandHandlers } from './misc';
import { musicCommandHandlers } from './music';
import { permissionsHandler } from './permissionsHandler';

// All command handlers should be listed here from the modules
const commandsHandlers: ICommand[] = [
  ...adminCommandHandlers,
  ...miscCommandHandlers,
  ...musicCommandHandlers,
];

export const mapCommands = () => {
  const commandMap: Map<String, Function> = new Map();
  commandsHandlers.forEach((handler) => {
    // Set the main command
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
