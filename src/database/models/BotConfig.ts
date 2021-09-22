import { Model, Sequelize } from 'sequelize';

const { DataTypes } = require('sequelize');

interface IBotConfig extends Model {
  id: string;
  prefix: string;
  preferredChannel: string;
}

export interface IBotConfigData extends IBotConfig {
  dataValues: {
    id: string;
    prefix: string;
    preferredChannel: string;
  };
}

export const BotConfigModel = (sequelize: Sequelize) =>
  sequelize.define<IBotConfig>(
    'BotConfig',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      prefix: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '!',
      },
      preferredChannel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {}
  );
