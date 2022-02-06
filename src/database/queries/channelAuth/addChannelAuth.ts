import Logger from '../../../logger/Logger';
import { ChannelAuth } from '../../models';

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
    Logger.log(
      'ERROR',
      `There was a error trying to create this guild ${guildId} and channel ${channelId}.`,
      err
    );
    throw err;
  }
};