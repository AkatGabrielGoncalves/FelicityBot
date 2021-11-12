/* eslint-disable import/first */
import * as dotenv from 'dotenv';

dotenv.config();

import Discord from 'discord.js';
import intents from './intents';
import { commandsHandler } from './modules/commandsHandler';
import { mapCommands } from './modules/commands';
import './database/index';

global.AbortController = require('abort-controller');

const commandsMap = mapCommands();

const client = new Discord.Client({ intents });

client.on('messageCreate', (message) => {
  commandsHandler(client, message, commandsMap);
});

client
  .login(process.env.BOT_TOKEN)
  .then(() => console.log('Bot is online'))
  .catch((err) => {
    console.log(`Bot failed to start ${err}`);
    process.exit(1);
  });
