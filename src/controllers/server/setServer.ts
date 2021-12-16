import { ICustomClient } from '../../interfaces/customInterfaces';
import { Server } from '../../database/models';
import logger from '../../logger/Logger';

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
    logger.log(
      'ERROR',
      `There was a error trying to set this guild ${guildId} prefix.`,
      new Error(err)
    );
    throw new Error(err);
  }
};
