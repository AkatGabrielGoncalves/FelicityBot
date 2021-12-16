import { Server } from '../../database/models';
import Logger from '../../logger/Logger';

export const getServers = async () => {
  try {
    const servers = await Server.findAll();

    return servers;
  } catch (err: any) {
    Logger.log('ERROR', `There was a error trying to get all guilds`, new Error(err));

    return null;
  }
};
