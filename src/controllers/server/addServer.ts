import { Server } from '../../database/models';
import logger from '../../logger/Logger';

export const addServer = async (guildId: string) => {
  try {
    await Server.create({
      id: Number(guildId),
    });
  } catch (err: any) {
    logger.log('ERROR', `There was a error trying to add this guild: ${guildId}.`, new Error(err));
    throw new Error(err);
  }
};
