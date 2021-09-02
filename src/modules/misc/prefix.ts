import { Client, Message } from 'discord.js';
import fs from 'fs';
import path from 'path';

export const handlePrefix = async (
  client: Client,
  message: Message,
  args: string[] // args[0] should be only the prefix
) => {
  if (!args[0] || args[0].length < 0 || args[0].length > 2)
    return await message.reply(
      'Alguma coisa tem que ser meu prefixo! São só um ou dois caracteres!'
    );

  try {
    const serverInfoJson = fs.readFileSync(
      path.resolve(__dirname, '..', 'serverInfo.json'),
      'utf8'
    );

    const serverInfoObj = JSON.parse(serverInfoJson) as { [key: string]: string };
    // eslint-disable-next-line prefer-destructuring
    serverInfoObj[`${message.guildId}`] = args[0];

    fs.writeFileSync(
      path.resolve(__dirname, '..', 'serverInfo.json'),
      JSON.stringify(serverInfoObj),
      'utf8'
    );
    return await message.reply(`Prefixo trocado para: ${args[0]}`);
  } catch (err) {
    return await message.reply('Não foi possivel mudar o prefixo :(');
  }
};