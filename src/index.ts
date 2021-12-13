/* eslint-disable import/first */
import * as dotenv from 'dotenv';

dotenv.config();

import logger from './logger/Logger';
import intents from './intents';
import { commandsHandler } from './modules/commandsHandler';
import { CustomClient } from './CustomClient';
import { registerGuild, unregisterGuild } from './events';

global.AbortController = require('abort-controller');

const client = new CustomClient({ intents });

client.on('messageCreate', (message) => {
  commandsHandler(client, message);
});

client.on('guildDelete', (guild) => {
  unregisterGuild(guild);
});

client.on('guildCreate', (guild) => {
  registerGuild(guild);
});

client.on('ready', async () => {
  const guildsCount = (await client.guilds.fetch()).size;

  client.user?.setActivity({
    type: 'LISTENING',
    name: `${guildsCount} servers; !help`,
  });
});

client
  .login(process.env.BOT_TOKEN)
  .then(async () => {
    logger.log('INFO', 'Bot is online.', new Error());
  })
  .catch((err) => {
    logger.log('ERROR', 'Bot failed to start.', new Error(err));
    process.exit(1);
  });
