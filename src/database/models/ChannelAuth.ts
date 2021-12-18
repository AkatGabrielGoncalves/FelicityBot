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
import { Server } from './Server';

export interface IChannelAuthAttributes {
  id: string;
  server_id: string;
  type: 'permitted' | 'excluded';
}

export class ChannelAuth extends Model<IChannelAuthAttributes> implements IChannelAuthAttributes {
  public id!: string;

  public server_id!: string;

  public type!: 'permitted' | 'excluded';

  // timestamps!
  public readonly created_at!: Date;

  public readonly updated_at!: Date;

  // these will not exist until `Model.init` was called.
  public getServer!: BelongsToGetAssociationMixin<Server>; // Note the null assertions!

  public setServer!: BelongsToSetAssociationMixin<Server, string>;

  public createServer!: BelongsToCreateAssociationMixin<Server>;

  public readonly server?: Server; // Note this is optional since it's only populated when explicitly requested in code

  public static associations: {
    server: Association<ChannelAuth, Server>;
  };

  /** DON'T USE THIS OUTSIDE OF THE DATABASE CLASS */
  static initialize = (sequelize: Sequelize) => {
    this.init(
      {
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          allowNull: false,
        },
        server_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: Server,
            key: 'id',
          },
        },
        type: {
          type: DataTypes.ENUM('permitted', 'excluded'),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'channel_auth',
      }
    );
  };

  static initAssociation = () => {
    this.belongsTo(Server, {
      foreignKey: 'server_id',
      targetKey: 'id',
      as: 'server',
    });
  };
}
