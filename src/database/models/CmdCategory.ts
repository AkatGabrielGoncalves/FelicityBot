/* eslint-disable import/no-cycle */
import {
  Model,
  Sequelize,
  DataTypes,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  Association,
} from 'sequelize';
import { Command } from './Command';

export interface ICmdCategoryAttributes {
  id: string;
  category: string;
}

export class CmdCategory extends Model<ICmdCategoryAttributes> implements ICmdCategoryAttributes {
  public id!: string;

  public category!: string;

  // timestamps!
  public readonly created_at!: Date;

  public readonly updated_at!: Date;

  // these will not exist until `Model.init` was called.
  public getCommands!: HasManyGetAssociationsMixin<Command>; // Note the null assertions!

  public addCommand!: HasManyAddAssociationMixin<Command, string>;

  public hasCommand!: HasManyHasAssociationMixin<Command, string>;

  public countCommands!: HasManyCountAssociationsMixin;

  public createCommand!: HasManyCreateAssociationMixin<Command>;

  public readonly commands?: Command[]; // Note this is optional since it's only populated when explicitly requested in code

  public static associations: {
    commands: Association<CmdCategory, Command>;
  };

  static initialize = (sequelize: Sequelize) => {
    this.init(
      {
        id: {
          type: DataTypes.BIGINT,
          unique: true,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        category: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'cmd_category',
      }
    );
  };

  static initAssociation = () => {
    this.hasMany(Command, {
      sourceKey: 'id',
      foreignKey: {
        name: 'category_id',
        allowNull: false,
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      as: 'commands',
    });
  };
}
