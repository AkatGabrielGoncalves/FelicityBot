/* eslint-disable import/first */
import * as dotenv from 'dotenv';

dotenv.config();

import Discord from 'discord.js';
import intents from './intents';
import { commandsHandler } from './modules/commandsHandler';
import { createDatabase, Database } from './database';
import { mapCommands } from './modules/commands';

global.AbortController = require('abort-controller');

const commandsMap = mapCommands();

let db: Database | null = null;

if (process.env.USESQLDB === 'TRUE') {
  createDatabase().then(() => {
    db = new Database();
  });
}

const client = new Discord.Client({ intents });

client.on('messageCreate', (message) => {
  commandsHandler(client, message, commandsMap, db);
});

client
  .login(process.env.BOT_TOKEN)
  .then(() => console.log('Bot is online'))
  .catch((err) => {
    console.log(`Bot failed to start ${err}`);
    process.exit(1);
  });
