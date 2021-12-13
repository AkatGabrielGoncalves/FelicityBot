import * as dotenv from 'dotenv';
/* eslint-disable import/first */

dotenv.config();

import { getServers } from './controllers/server/getServers';
import logger from './logger/Logger';
import intents from './intents';
import { commandsHandler } from './modules/commandsHandler';
import { CustomClient } from './CustomClient';
import { addServer, deleteServer } from './controllers/server';

global.AbortController = require('abort-controller');

const client = new CustomClient({ intents });

client.on('messageCreate', (message) => {
  commandsHandler(client, message);
});

client.on('guildDelete', (guild) => {
  deleteServer(client, guild.id);
});

client.on('guildCreate', (guild) => {
  addServer(client, guild.id);
});

client.on('ready', async () => {
  const guilds = await client.guilds.fetch();
  const servers = await getServers();

  if (servers) {
    const serversIds = servers.map((server) => server.id);

    guilds.forEach((guild) => {
      if (!serversIds.includes(Number(guild.id))) {
        addServer(client, guild.id);
      }
    });
  }

  const guildCount = guilds.size;

  client.user?.setActivity({
    type: 'LISTENING',
    name: `${guildCount} servers; !help`,
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
