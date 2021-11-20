import { Model, ModelCtor, Sequelize } from 'sequelize';
import databaseConfig from '../config/database';
import BotConfig, { IBotConfigAttributes } from './models/BotConfig';
import logger from '../logger/Logger';

export type IModels = {
  BotConfig: ModelCtor<Model<IBotConfigAttributes>>;
};

export class Database extends Sequelize {
  baseModels: typeof BotConfig[];

  models!: IModels;

  constructor() {
    super(databaseConfig);
    this.verifyConnection();
    this.baseModels = [BotConfig];
    this.initModels();
    this.sync({ alter: true });
  }

  private initModels = () => {
    this.baseModels.forEach((model) => {
      model.initialize(this);
    });
  };

  private verifyConnection = async () => {
    try {
      await this.authenticate();
      logger.log(
        'INFO',
        'Connection to database has been established successfully.',
        new Error()
      );
    } catch (err: any) {
      logger.log(
        'ERROR',
        'Database failed to establish a connection',
        new Error(err)
      );
      process.exit(1);
    }
  };
}

const createDatabase = async () => {
  const { database, username, password, host, port, dialect, logging } =
    databaseConfig;
  const conn = new Sequelize({ username, password, host, port, dialect, logging });

  try {
    logger.log('INFO', `Trying to create Database: '${database}'.`, new Error());

    await conn.query(`CREATE DATABASE ${database}`);

    logger.log('INFO', `Database created: '${database}'.`, new Error());
    conn.close();
  } catch (err: any) {
    conn.close();
    if (err.original.errno === 1007) {
      logger.log('WARN', 'Database already exists.', new Error(err));
    } else {
      logger.log('ERROR', 'Error while creating the Database.', new Error(err));
    }
  }
};

export const instantiateDatabase = () => {
  if (process.env.USE_SQL_DB === 'TRUE') {
    createDatabase().then(() => new Database());
  }
  return null;
};
