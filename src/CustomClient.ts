import { Client, ClientOptions } from 'discord.js';
import database, { Database } from './database';
import { ICommand, ICustomClient } from './interfaces/customInterfaces';
import { mapCommands } from './modules/commands';

export class CustomClient extends Client implements ICustomClient {
  commandsMap: {
    commandMap: Map<String, { handler: ICommand; execute: Function }>;
    commandsHandlersMap: Map<String, any[]>;
  };

  db: Database;

  constructor(options: ClientOptions) {
    super(options);
    this.commandsMap = mapCommands();
    this.db = database;
  }
}
