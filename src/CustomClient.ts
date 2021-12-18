import { Client, ClientOptions } from 'discord.js';
import database, { Database } from './database';
import { ICommand, ICustomClient } from './interfaces/customInterfaces';
import { mapCommands } from './modules/commands';

export class CustomClient extends Client implements ICustomClient {
  commandsMap: Map<String, { handler: ICommand; execute: Function }>;

  commandsCategoriesMap: Map<String, any[]>;

  db: Database;

  serverCache: Map<string, string>;

  constructor(options: ClientOptions) {
    super(options);
    ({ commandsMap: this.commandsMap, commandsCategoriesMap: this.commandsCategoriesMap } =
      mapCommands());
    this.db = database;
    // Cache patrocinado pelo https://github.com/GustavoBitten
    this.serverCache = new Map();
  }
}
