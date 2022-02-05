import Logger from '../../../logger/Logger';
import { ChannelAuth } from '../../models';

export const getChannelAuths = async (guildId: string) => {
  try {
    const channels = await ChannelAuth.findAll({
      where: {
        server_id: guildId,
      },
    });

    return channels;
  } catch (err: any) {
    Logger.log('ERROR', `There was a error trying to get this guild ${guildId} channels.`, err);
    throw err;
  }
};
