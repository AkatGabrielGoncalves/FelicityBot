/* eslint-disable import/first */
import * as dotenv from 'dotenv';

dotenv.config();

import { Client, ClientOptions } from 'discord.js';
import intents from './intents';
import { commandsHandler } from './modules/commandsHandler';
import { mapCommands } from './modules/commands';
import { instantiateDatabase } from './database/index';
import { ICommand, ICustomClient } from './interfaces/customInterfaces';

global.AbortController = require('abort-controller');

class CustomClient extends Client implements ICustomClient {
  commandsMap: {
    commandMap: Map<String, { handler: ICommand; execute: Function }>;
    commandsHandlersMap: Map<String, any[]>;
  };

  db: null;

  constructor(options: ClientOptions) {
    super(options);
    this.commandsMap = mapCommands();
    this.db = instantiateDatabase();
  }
}

const client = new CustomClient({ intents });

client.on('messageCreate', (message) => {
  commandsHandler(client, message);
});

client
  .login(process.env.BOT_TOKEN)
  .then(() => console.log('Bot is online'))
  .catch((err) => {
    console.log(`Bot failed to start ${err}`);
    process.exit(1);
  });
