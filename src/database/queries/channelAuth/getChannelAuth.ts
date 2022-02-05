import Logger from '../../../logger/Logger';
import { ChannelAuth } from '../../models';

export const getChannelAuth = async (channelId: string, guildId: string) => {
  try {
    const channel = await ChannelAuth.findOne({
      where: {
        id: channelId,
        server_id: guildId,
      },
    });

    return channel;
  } catch (err: any) {
    Logger.log(
      'ERROR',
      `There was a error trying to get this guild ${guildId} and channel ${channelId}.`,
      err
    );
    throw err;
  }
};
