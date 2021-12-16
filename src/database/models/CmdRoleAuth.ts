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
import { Server } from './Server';

export interface ICmdRoleAuthAttributes {
  id: string;
  server_id: string;
  cmd_id: string;
  type: 'permitted' | 'excluded';
}

export class CmdRoleAuth extends Model<ICmdRoleAuthAttributes> implements ICmdRoleAuthAttributes {
  public id!: string;

  public server_id!: string;

  public cmd_id!: string;

  public type!: 'permitted' | 'excluded';

  // timestamps!
  public readonly created_at!: Date;

  public readonly updated_at!: Date;

  // these will not exist until `Model.init` was called.
  public getServer!: BelongsToGetAssociationMixin<Server>; // Note the null assertions!

  public setServer!: BelongsToSetAssociationMixin<Server, string>;

  public createServer!: BelongsToCreateAssociationMixin<Server>;

  public getCommand!: BelongsToGetAssociationMixin<Command>;

  public setCommand!: BelongsToSetAssociationMixin<Command, string>;

  public createCommand!: BelongsToCreateAssociationMixin<Command>;

  public readonly server?: Server; // Note this is optional since it's only populated when explicitly requested in code

  public readonly command?: Command;

  public static associations: {
    server: Association<CmdRoleAuth, Server>;
    command: Association<CmdRoleAuth, Command>;
  };

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
        cmd_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: Command,
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
        tableName: 'cmd_role_auth',
      }
    );
  };

  static initAssociation = () => {
    this.belongsTo(Server, {
      foreignKey: 'server_id',
      targetKey: 'id',
      as: 'server',
    });

    this.belongsTo(Command, {
      foreignKey: 'cmd_id',
      targetKey: 'id',
      as: 'command',
    });
  };
}
