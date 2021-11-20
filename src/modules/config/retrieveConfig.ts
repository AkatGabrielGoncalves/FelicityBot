import fs from 'fs';
import path from 'path';
import BotConfig from '../../database/models/BotConfig';

export const retrieveConfig = async (guildId: string) => {
  let serverConfig = null;

  if (process.env.USE_SQL_DB === 'TRUE') {
    try {
      serverConfig = await BotConfig.findByPk(guildId);
      if (!serverConfig) {
        await BotConfig.create({
          id: guildId,
          preferredChannel: null,
        });
      }
    } catch (err) {
      console.log(
        `There was a error trying to get this guild ${guildId} config.`,
        err
      );
    }
  }

  if (process.env.USE_SQL_DB !== 'TRUE') {
    const location = path.resolve(__dirname, '..', '..', 'database', 'db.json');
    if (fs.existsSync(location)) {
      const json = fs.readFileSync(location, 'utf8');

      serverConfig = JSON.parse(json);
      if (!serverConfig[guildId]) {
        serverConfig[guildId] = { prefix: '!', preferredChannel: null };
        fs.writeFileSync(location, JSON.stringify(serverConfig));
      }
      serverConfig = serverConfig[guildId];
    } else {
      fs.writeFileSync(location, JSON.stringify({}));
    }
  }
  if (!serverConfig) serverConfig = { prefix: '!', preferredChannel: null };

  return serverConfig;
};
