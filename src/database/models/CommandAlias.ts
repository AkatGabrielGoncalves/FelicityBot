/* eslint-disable import/no-cycle */
import {
  Model,
  Sequelize,
  DataTypes,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  Association,
} from 'sequelize';
import { Command } from './Command';

export interface ICommandAliasAttributes {
  id: string;
  cmd_id: string;
  name: string;
}

export class CommandAlias
  extends Model<ICommandAliasAttributes>
  implements ICommandAliasAttributes
{
  id!: string;

  cmd_id!: string;

  name!: string;

  // timestamps!
  public readonly created_at!: Date;

  public readonly updated_at!: Date;

  // these will not exist until `Model.init` was called.
  public getCommand!: BelongsToGetAssociationMixin<Command>; // Note the null assertions!

  public setCommand!: BelongsToSetAssociationMixin<Command, string>;

  public createCommand!: BelongsToCreateAssociationMixin<Command>;

  public readonly command?: Command; // Note this is optional since it's only populated when explicitly requested in code

  public static associations: {
    command: Association<CommandAlias, Command>;
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
        cmd_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: Command,
            key: 'id',
          },
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'command_alias',
      }
    );
  };

  static initAssociation = () => {
    this.belongsTo(Command, {
      foreignKey: 'cmd_id',
      targetKey: 'id',
      as: 'command',
    });
  };
}
