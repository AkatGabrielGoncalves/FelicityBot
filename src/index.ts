import * as dotenv from 'dotenv';
/* eslint-disable import/first */

dotenv.config();

import Logger from './logger/Logger';
import intents from './intents';
import { CustomClient } from './CustomClient';
import { addServer, deleteServer, getServers } from './database/queries/server';
import { CommandHandler } from './modules/CommandHandler';

const client = new CustomClient({ intents });
const commandHandler = new CommandHandler(client);

client.on('messageCreate', (message) => {
  commandHandler.main(message);
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
});

client
  .login(process.env.BOT_TOKEN)
  .then(() => {
    Logger.log('INFO', 'Bot is online.', new Error());
  })
  .catch((err) => {
    Logger.log('ERROR', 'Bot failed to start.', err);
    process.exit(1);
  });
