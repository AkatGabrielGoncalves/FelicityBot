import { Model, ModelCtor, Sequelize } from 'sequelize';
import databaseConfig from '../config/database';
import BotConfig, { IBotConfigAttributes } from './models/BotConfig';

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
      console.log('[Sequelize] Connection has been established successfully.');
    } catch (e: any) {
      console.log(
        `[Sequelize] DATABASE FAILED TO ESTABLISH A CONNECTION:`,
        e.original
      );
      process.exit(1);
    }
  };
}

const createDatabase = async () => {
  const { database, username, password, host, port, dialect } = databaseConfig;
  const conn = new Sequelize({ username, password, host, port, dialect });

  try {
    console.log(`[Sequelize] Trying to create Database '${database}'`);

    await conn.query(`CREATE DATABASE ${database}`);
    conn.close();
  } catch (err: any) {
    conn.close();
    if (err.original.errno === 1007) {
      console.log('[Sequelize] Database already exists.');
    } else {
      console.log(
        '[Sequelize] Error while creating the Database. Error:',
        err.original
      );
    }
  }
};

export const instantiateDatabase = () => {
  if (process.env.USESQLDB === 'TRUE') {
    createDatabase().then(() => new Database());
  }
  return null;
};
