/* eslint-disable import/first */
import * as dotenv from 'dotenv';

dotenv.config();

import Discord from 'discord.js';
import intents from './intents';
import { commandsHandler } from './modules/commandsHandler';
import { Database } from './database';
import { connection } from './database/connection';

global.AbortController = require('abort-controller');

const { database, password, username, host, port, dialect } = connection;

let db: Database | null = null;

if (process.env.USESQLDB === 'TRUE') {
  db = new Database();

  db?.connectToDatabase({ database, password, username, host, port, dialect });
}

/* intents are all the events that this bot will listen,
 which is everything. You can change this behavior at ./intents.ts */
const client = new Discord.Client({ intents });

// This is our listener that captures all messages sent
client.on('messageCreate', (message) => {
  commandsHandler(client, message, db);
});

// Well, this creates a connection to our bot
client
  .login(process.env.BOT_TOKEN)
  .then(() => console.log('Bot is online'))
  .catch((err) => {
    console.log(`Bot failed to start ${err}`);
  });
