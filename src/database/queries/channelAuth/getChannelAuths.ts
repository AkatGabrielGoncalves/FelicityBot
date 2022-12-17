import Logger from '../../../logger/Logger';
import { ChannelAuth } from '../../models';

export const getChannelAuths = async (guildId: string) => {
  try {
    return await ChannelAuth.findAll({
      where: {
        server_id: guildId,
      },
    });
  } catch (err: any) {
    Logger.error(`There was a error trying to get this guild ${guildId} channels.`, err);
    throw err;
  }
};
