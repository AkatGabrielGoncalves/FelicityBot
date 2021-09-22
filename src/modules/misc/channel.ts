import { Client, Message } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Database } from '../../database';

export const handleChannel = async (
  client: Client,
  message: Message,
  args: string[], // args[0] should be only the prefix
  db: Database
) => {
  const arg = args.join('');

  let preferredChannel = null;
  if (!arg) {
    preferredChannel = message.channelId;
  }

  if (arg === 'default') {
    preferredChannel = null;
  }

  try {
    if (db && process.env.USESQLDB === 'TRUE') {
      await db.models.BotConfigModel.update(
        {
          preferredChannel,
        },
        {
          where: {
            id: message.guildId,
          },
        }
      );
    }

    if (process.env.USESQLDB !== 'TRUE') {
      const location = path.resolve(__dirname, '..', '..', 'database', 'db.json');

      const serverInfoJson = fs.readFileSync(location, 'utf8');

      const serverInfoObj = JSON.parse(serverInfoJson) as {
        [key: string]: { preferredChannel: string | null };
      };
      // eslint-disable-next-line prefer-destructuring
      serverInfoObj[`${message.guildId}`].preferredChannel = preferredChannel;

      fs.writeFileSync(location, JSON.stringify(serverInfoObj), 'utf8');
    }

    if (arg !== 'default') {
      return await message.reply(
        `Agora eu só irei responder nesse canal! Use o comando '!channel default' para remover este comportamento!`
      );
    }
    return await message.reply(`Agora eu tô prestando atenção em todos os chats!`);
  } catch (err) {
    return await message.reply('Não foi possivel me prender neste canal. :(');
  }
};
