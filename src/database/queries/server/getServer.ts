import { ICustomClient } from '../../../interfaces/customInterfaces';
import Logger from '../../../logger/Logger';
import { Server } from '../../models';

export const getServer = async (client: ICustomClient, guildId: string) => {
  const saveInCache = (prefix: string) => client.serverCache.set(guildId, prefix);
  try {
    const server = await Server.findByPk(guildId);

    if (!server) return '!';

    saveInCache(server.prefix);
    return server.prefix;
  } catch (err: any) {
    Logger.log('ERROR', `There was a error trying to get this guild ${guildId} config.`, err);

    saveInCache('!');
    return '!';
  }
};
