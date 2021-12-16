import { Server } from '../../database/models';
import logger from '../../logger/Logger';

export const getServers = async () => {
  try {
    const servers = await Server.findAll();

    return servers;
  } catch (err: any) {
    logger.log('ERROR', `There was a error trying to get all guilds`, new Error(err));

    return null;
  }
};
