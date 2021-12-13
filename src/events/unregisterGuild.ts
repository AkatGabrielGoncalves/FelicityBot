import { Guild } from 'discord.js';
import { Server } from '../database/models';

export const unregisterGuild = async (guild: Guild) => {
  await Server.destroy({
    where: {
      id: Number(guild.id),
    },
  });
};
