import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { ICommand, ICustomClient } from '../../../../interfaces/customInterfaces';

export const defaultEmbed = (client: ICustomClient) => {
  const embedFields: EmbedFieldData[] = [];
  client.commandsMap.commandsHandlersMap.forEach((handlers) => {
    const field = {
      name: handlers[0].type,
      inline: true,
      value: `${handlers.map((handler) => `!${handler.command}\n`).join('')}`,
    };
    embedFields.push(field);
  });
  return new MessageEmbed()
    .setTitle('Todos os comandos')
    .setDescription('Aqui estão todos os comandos!')
    .addFields(embedFields);
};

export const specificEmbed = (client: ICustomClient, command: string) => {
  const embedFields: EmbedFieldData[] = [];

  const handler = client.commandsMap.commandMap.get(command)?.handler as ICommand;

  const aliasField = {
    name: 'Apelido',
    inline: true,
    value: handler.alias[0]
      ? `${handler.alias.map((alias) => `!${alias}\n`).join('')}`
      : 'Não há apelidos',
  };

  const usageField = {
    name: 'Exemplos',
    inline: true,
    value: `${handler.usage.map((usage) => `!${usage}\n`).join('')}`,
  };

  embedFields.push(aliasField, usageField);

  console.log(embedFields);

  return new MessageEmbed()
    .setTitle(handler.command)
    .setDescription(handler.description)
    .addFields(embedFields);
};
