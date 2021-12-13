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
import { ChannelAuth } from './ChannelAuth';

export interface IServerAttributes {
  id: number;
  prefix?: string;
}

export class Server extends Model<IServerAttributes> implements IServerAttributes {
  public id!: number;

  public prefix!: string;

  // timestamps!
  public readonly created_at!: Date;

  public readonly updated_at!: Date;

  // these will not exist until `Model.init` was called.
  public getChannelAuths!: HasManyGetAssociationsMixin<ChannelAuth>; // Note the null assertions!

  public addChannelAuth!: HasManyAddAssociationMixin<ChannelAuth, number>;

  public hasChannelAuth!: HasManyHasAssociationMixin<ChannelAuth, number>;

  public countChannelAuths!: HasManyCountAssociationsMixin;

  public createChannelAuth!: HasManyCreateAssociationMixin<ChannelAuth>;

  public readonly channelAuths?: ChannelAuth[]; // Note this is optional since it's only populated when explicitly requested in code

  public static associations: {
    channelAuths: Association<Server, ChannelAuth>;
  };

  /** DON'T USE THIS OUTSIDE OF THE DATABASE CLASS */
  static initialize = (sequelize: Sequelize) => {
    this.init(
      {
        id: {
          type: DataTypes.BIGINT,
          unique: true,
          primaryKey: true,
          allowNull: false,
        },
        prefix: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: '!',
        },
      },
      {
        sequelize,
        tableName: 'server',
      }
    );
  };

  /** DON'T USE THIS OUTSIDE OF THE DATABASE CLASS */
  static initAssociation = () => {
    this.hasMany(ChannelAuth, {
      sourceKey: 'id',
      foreignKey: {
        name: 'server_id',
        allowNull: false,
      },
      foreignKeyConstraint: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      as: 'channelAuths',
    });
  };
}
