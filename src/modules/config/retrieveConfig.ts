import BotConfig from '../../database/models/Server';
import logger from '../../logger/Logger';

export const retrieveConfig = async (guildId: string) => {
  let serverConfig = null;

  try {
    serverConfig = await BotConfig.findByPk(guildId);
    if (!serverConfig) {
      await BotConfig.create({
        id: guildId,
        preferredChannel: null,
      });
    }
  } catch (err: any) {
    logger.log(
      'ERROR',
      `There was a error trying to get this guild ${guildId} config.`,
      new Error(err)
    );
    throw new Error(err);
  }

  return serverConfig;
};
