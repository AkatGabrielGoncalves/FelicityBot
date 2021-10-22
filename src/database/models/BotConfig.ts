import { Model, Sequelize } from 'sequelize';

const { DataTypes } = require('sequelize');

export interface IBotConfigAttributes {
  id: string;
  prefix?: string;
  preferredChannel: string | null;
}

export default class BotConfig
  extends Model<IBotConfigAttributes>
  implements IBotConfigAttributes
{
  public id!: string;

  public prefix!: string;

  public preferredChannel!: string;

  static initialize = (sequelize: Sequelize) => {
    this.init(
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
      {
        sequelize,
        tableName: 'BotConfigs',
      }
    );
  };
}
