import { ICustomClient } from '../../interfaces/customInterfaces';
import { Server } from '../../database/models';
import logger from '../../logger/Logger';

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
    logger.log(
      'ERROR',
      `There was a error trying to delete this guild: ${guildId}`,
      new Error(err)
    );
    throw new Error(err);
  }
};
