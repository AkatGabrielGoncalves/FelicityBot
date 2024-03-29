import Logger from '../../../logger/Logger';
import { ChannelAuth } from '../../models';

export const getChannelAuth = async (channelId: string, guildId: string) => {
  try {
    return await ChannelAuth.findOne({
      where: {
        id: channelId,
        server_id: guildId,
      },
    });
  } catch (err: any) {
    Logger.error(
      `There was a error trying to get this guild ${guildId} and channel ${channelId}.`,
      err
    );
    throw err;
  }
};
