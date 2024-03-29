import { ICustomClient } from '../../../interfaces/customInterfaces';
import Logger from '../../../logger/Logger';
import { Server } from '../../models';

export const deleteServer = async (client: ICustomClient, guildId: string) => {
  const removeFromCache = () => {
    client.serverCache.delete(guildId);
  };

  try {
    await Server.destroy({
      where: {
        id: guildId,
      },
    });
    removeFromCache();
  } catch (err: any) {
    Logger.error(`There was a error trying to delete this guild: ${guildId}`, err);
    throw err;
  }
};
