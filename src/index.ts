import * as dotenv from 'dotenv';
/* eslint-disable import/first */

dotenv.config();

import os from 'os';
import Logger from './logger/Logger';
import intents from './intents';
import { commandsHandler } from './modules/commandsHandler';
import { CustomClient } from './CustomClient';
import { addServer, deleteServer, getServers } from './controllers/server';

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
      if (!serversIds.includes(guild.id)) {
        addServer(client, guild.id);
      }
    });

    serversIds.forEach((serverId) => {
      if (!guilds.has(serverId)) {
        deleteServer(client, serverId);
      }
    });
  }

  client.user?.setActivity({
    type: 'LISTENING',
    name: `${guilds.size} servers; !help`,
  });

  // Print the result in MB
  console.log(os.totalmem() / (1024 * 1024));

  // Get the number of available memory in Byte
  console.log(os.freemem() / (1024 * 1024));
});

client
  .login(process.env.BOT_TOKEN)
  .then(() => {
    Logger.log('INFO', 'Bot is online.', new Error());
  })
  .catch((err) => {
    Logger.log('ERROR', 'Bot failed to start.', new Error(err));
    process.exit(1);
  });
