import Logger from '../../../logger/Logger';
import { Server } from '../../models';

export const getServers = async () => {
  try {
    return await Server.findAll();
  } catch (err: any) {
    Logger.error(`There was a error trying to get all guilds`, err);

    return null;
  }
};
