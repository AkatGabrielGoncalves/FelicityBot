import { ICustomClient } from '../../interfaces/customInterfaces';
import { Server } from '../../database/models';
import Logger from '../../logger/Logger';

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
    Logger.log('ERROR', `There was a error trying to delete this guild: ${guildId}`, err);
    throw new Error(err);
  }
};
