import { Guild } from 'discord.js';
import { Server } from '../database/models';

export const registerGuild = async (guild: Guild) => {
  await Server.create({
    id: Number(guild.id),
  });
};
