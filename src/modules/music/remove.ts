import { Client, Message } from 'discord.js';
// eslint-disable-next-line import/no-cycle
import { connections } from './play';

export const handleRemove = async (
  client: Client,
  message: Message,
  args: string[]
) => {
  if (!connections[`${message.guildId}`]) {
    return message.reply(`Não há player de música nesse servidor!`);
  }
  const indexToBeRemoved = args.join('');
  if (!indexToBeRemoved) {
    return message.reply(`É impossível remover o nada, tá bom?`);
  }

  if (Number.isNaN(Number(indexToBeRemoved))) {
    return message.reply(
      `O que é que você escreveu ai? "${indexToBeRemoved}" não é nem um número!`
    );
  }

  if (Number(indexToBeRemoved) < 1) {
    return message.reply(
      `Eu até podia remover usando números negativos... Mas removeram essa função minha. Um absurdo não?`
    );
  }

  const conn = connections[`${message.guildId}`];

  return conn.remove(message, args);
};
