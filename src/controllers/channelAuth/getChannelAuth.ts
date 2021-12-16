import { ChannelAuth } from '../../database/models';
import logger from '../../logger/Logger';

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
    logger.log(
      'ERROR',
      `There was a error trying to get this guild ${guildId} and channel ${channelId}.`,
      new Error(err)
    );
    throw new Error(err);
  }
};
