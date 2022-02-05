import Logger from '../../../logger/Logger';
import { Server } from '../../models';

export const getServers = async () => {
  try {
    const servers = await Server.findAll();

    return servers;
  } catch (err: any) {
    Logger.log('ERROR', `There was a error trying to get all guilds`, err);

    return null;
  }
};
