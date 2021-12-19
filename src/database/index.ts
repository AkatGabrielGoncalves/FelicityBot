import { Model, ModelCtor, Sequelize } from 'sequelize';
import {
  ICmdRoleAuthAttributes,
  ICommandAliasAttributes,
  ICmdCategoryAttributes,
  IChannelAuthAttributes,
  IServerAttributes,
  ICommandAttributes,
  ChannelAuth,
  CmdCategory,
  CmdRoleAuth,
  Command,
  CommandAlias,
  Server,
} from './models';
import databaseConfig from '../config/database';
import Logger from '../logger/Logger';

export type IModels = {
  Server: ModelCtor<Model<IServerAttributes>>;
  CommandAlias: ModelCtor<Model<ICommandAliasAttributes>>;
  Command: ModelCtor<Model<ICommandAttributes>>;
  CmdRoleAuth: ModelCtor<Model<ICmdRoleAuthAttributes>>;
  CmdCategory: ModelCtor<Model<ICmdCategoryAttributes>>;
  ChannelAuth: ModelCtor<Model<IChannelAuthAttributes>>;
};

export class Database extends Sequelize {
  baseModels: (
    | typeof ChannelAuth
    | typeof CmdCategory
    | typeof CmdRoleAuth
    | typeof Command
    | typeof CommandAlias
    | typeof Server
  )[];

  models!: IModels;

  constructor() {
    super(databaseConfig);
    this.verifyConnection();
    this.baseModels = [Server, CmdCategory, Command, CmdRoleAuth, CommandAlias, ChannelAuth];
    this.initModels();
    this.createAssociations();
    this.sync();
  }

  private initModels = () => {
    this.baseModels.forEach((model) => {
      model.initialize(this);
    });
  };

  private createAssociations = () => {
    this.baseModels.forEach((model) => {
      model.initAssociation();
    });
  };

  private verifyConnection = async () => {
    try {
      await this.authenticate();
      Logger.log('INFO', 'Connection to database has been established successfully.', new Error());
    } catch (err: any) {
      Logger.log('ERROR', 'Database failed to establish a connection', err);
      process.exit(1);
    }
  };
}

export default new Database();
