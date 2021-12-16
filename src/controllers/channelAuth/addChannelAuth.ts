import { ChannelAuth } from '../../database/models';
import logger from '../../logger/Logger';

export const addChannelAuth = async (
  channelId: string,
  guildId: string,
  type: 'permitted' | 'excluded'
) => {
  try {
    const channel = await ChannelAuth.create({
      id: channelId,
      server_id: guildId,
      type,
    });

    return channel;
  } catch (err: any) {
    logger.log(
      'ERROR',
      `There was a error trying to create this guild ${guildId} and channel ${channelId}.`,
      new Error(err)
    );
    throw new Error(err);
  }
};
