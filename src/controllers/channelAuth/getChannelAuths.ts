import { ChannelAuth } from '../../database/models';
import logger from '../../logger/Logger';

export const getChannelAuths = async (guildId: string) => {
  try {
    const channels = await ChannelAuth.findAll({
      where: {
        server_id: guildId,
      },
    });

    return channels;
  } catch (err: any) {
    logger.log(
      'ERROR',
      `There was a error trying to get this guild ${guildId} channels.`,
      new Error(err)
    );
    throw new Error(err);
  }
};
