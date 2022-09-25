import { ICustomClient } from '../../../interfaces/customInterfaces';
import Logger from '../../../logger/Logger';
import { Server } from '../../models';

export const setServer = async (client: ICustomClient, guildId: string, prefix: string) => {
  const saveInCache = () => client.serverCache.set(guildId, prefix);
  try {
    await Server.update(
      { prefix },
      {
        where: {
          id: guildId,
        },
      }
    );

    saveInCache();
    return prefix;
  } catch (err: any) {
    Logger.error(`There was a error trying to set this guild ${guildId} prefix.`, err);
    throw err;
  }
};
