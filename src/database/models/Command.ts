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
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  Association,
} from 'sequelize';
import { CmdCategory } from './CmdCategory';
import { CmdRoleAuth } from './CmdRoleAuth';
import { CommandAlias } from './CommandAlias';

export interface ICommandAttributes {
  id: number;
  category_id: number;
  name: string;
}

export class Command extends Model<ICommandAttributes> implements ICommandAttributes {
  id!: number;

  category_id!: number;

  name!: string;

  // timestamps!
  public readonly created_at!: Date;

  public readonly updated_at!: Date;

  // these will not exist until `Model.init` was called.
  // Has many association
  public getCommandAliases!: HasManyGetAssociationsMixin<CommandAlias>; // Note the null assertions!

  public addCommandAlias!: HasManyAddAssociationMixin<CommandAlias, number>;

  public hasCommandAlias!: HasManyHasAssociationMixin<CommandAlias, number>;

  public countCommandAliases!: HasManyCountAssociationsMixin;

  public createCommandAlias!: HasManyCreateAssociationMixin<CommandAlias>;

  // Has many association
  public getCmdRoleAuths!: HasManyGetAssociationsMixin<CmdRoleAuth>;

  public addCmdRoleAuth!: HasManyAddAssociationMixin<CmdRoleAuth, number>;

  public hasCmdRoleAuth!: HasManyHasAssociationMixin<CmdRoleAuth, number>;

  public countCmdRoleAuths!: HasManyCountAssociationsMixin;

  public createCmdRoleAuth!: HasManyCreateAssociationMixin<CmdRoleAuth>;

  // Belongs to association
  public getCmdCategory!: BelongsToGetAssociationMixin<CmdCategory>;

  public setCmdCategory!: BelongsToSetAssociationMixin<CmdCategory, number>;

  public createCmdCategory!: BelongsToCreateAssociationMixin<CmdCategory>;

  public readonly commandAliases?: CommandAlias[]; // Note this is optional since it's only populated when explicitly requested in code

  public readonly cmdRoleAuths?: CmdRoleAuth[];

  public readonly cmdCategory?: CmdCategory;

  public static associations: {
    commandAliases: Association<Command, CommandAlias>;
    cmdRoleAuths: Association<Command, CmdRoleAuth>;
    cmdCategory: Association<Command, CmdRoleAuth>;
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
        category_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: CmdCategory,
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
        tableName: 'command',
      }
    );
  };

  static association = () => {
    this.hasMany(CommandAlias, {
      sourceKey: 'id',
      foreignKey: {
        name: 'cmd_id',
        allowNull: false,
      },
      foreignKeyConstraint: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      as: 'commandAliases',
    });

    this.hasMany(CmdRoleAuth, {
      sourceKey: 'id',
      foreignKey: {
        name: 'cmd_id',
        allowNull: false,
      },
      foreignKeyConstraint: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      as: 'cmdRoleAuths',
    });

    this.belongsTo(CmdCategory, {
      foreignKey: 'category_id',
      targetKey: 'id',
      as: 'cmdCategory',
    });
  };
}
