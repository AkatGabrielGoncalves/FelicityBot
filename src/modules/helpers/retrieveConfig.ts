import fs from 'fs';
import path from 'path';
import { Database } from '../../database';
import { IBotConfigData } from '../../database/models/BotConfig';

export const retrieveConfig = async (db: Database | null, guildId: string) => {
  let data = null;

  if (db && process.env.USESQLDB === 'TRUE') {
    try {
      const { dataValues } = (await db.models.BotConfigModel.findByPk(
        guildId
      )) as IBotConfigData;
      data = dataValues;
    } catch (err) {
      await db.models.BotConfigModel.create({
        id: guildId,
        preferredChannel: null,
      });
    }
  }

  if (process.env.USESQLDB !== 'TRUE') {
    const location = path.resolve(__dirname, '..', '..', 'database', 'db.json');
    if (fs.existsSync(location)) {
      const json = fs.readFileSync(location, 'utf8');

      data = JSON.parse(json);
      if (!data[guildId]) {
        data[guildId] = { prefix: '!', preferredChannel: null };
        fs.writeFileSync(location, JSON.stringify(data));
      }
      data = data[guildId];
    } else {
      fs.writeFileSync(location, JSON.stringify({}));
    }
  }
  if (!data) data = { prefix: '!', preferredChannel: null };

  return data;
};
