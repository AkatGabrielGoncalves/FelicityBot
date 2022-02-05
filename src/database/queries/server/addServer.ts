import { ICustomClient } from '../../../interfaces/customInterfaces';
import Logger from '../../../logger/Logger';
import { Server } from '../../models';

export const addServer = async (client: ICustomClient, guildId: string) => {
  const saveInCache = (prefix: string) => client.serverCache.set(guildId, prefix);
  try {
    const { prefix } = await Server.create({
      id: guildId,
    });
    saveInCache(prefix);
  } catch (err: any) {
    Logger.log('ERROR', `There was a error trying to add this guild: ${guildId}.`, err);
  }
};
