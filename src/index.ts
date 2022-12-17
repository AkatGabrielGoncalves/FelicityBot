import * as dotenv from 'dotenv';
/* eslint-disable import/first */

dotenv.config();

import { ActivityType, REST, Routes } from 'discord.js';
import Logger from './logger/Logger';
import intents from './intents';
import { CustomClient } from './CustomClient';
import { addServer, deleteServer, getServers } from './database/queries/server';
import { CommandHandler } from './modules/CommandHandler';

const client = new CustomClient({ intents });
const commandHandler = new CommandHandler(client);

client.on('messageCreate', (message) => {
  commandHandler.message(message);
});

client.on('interactionCreate', (interaction: any) => {
  commandHandler.interaction(interaction!);
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

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);

  Logger.info('Started refreshing application (/) commands.');

  const commands = [...client.commandsMap.keys()].map((commandName) => ({
    name: commandName,
    description: client.commandsMap.get(commandName)?.description,
    ...(client.commandsMap.get(commandName)?.options
      ? { options: client.commandsMap.get(commandName)?.options }
      : {}),
  }));

  await rest.put(Routes.applicationCommands(client.application?.id!), {
    body: commands,
  });

  Logger.info('Successfully reloaded application (/) commands.');

  client.user?.setActivity({
    type: ActivityType.Listening,
    name: `${guilds.size} servers; !help`,
  });
});

client
  .login(process.env.BOT_TOKEN)
  .then(() => {
    Logger.info('Bot is online.');
  })
  .catch((err) => {
    Logger.error('Bot failed to start.', err);
    process.exit(1);
  });
