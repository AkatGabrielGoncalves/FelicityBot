import { Model, ModelCtor, Options, Sequelize } from 'sequelize';
import { BotConfigModel } from './models/BotConfig';

export class Database {
  conn: Sequelize | null;

  models: { [key: string]: ModelCtor<Model> };

  constructor() {
    this.conn = null;
    this.models = {};
  }

  createDatabase = async ({
    database,
    password,
    username,
    host,
    port,
    dialect,
  }: Options) => {
    const conn = new Sequelize({ username, password, host, port, dialect });

    try {
      if (conn) {
        console.log(`[Sequelize] Trying to create Database '${database}'`);
        await conn.query(`CREATE DATABASE ${database}`);
      }
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

  connectToDatabase = async ({
    database,
    password,
    username,
    host,
    port,
    dialect,
  }: Options) => {
    await this.createDatabase({ database, password, username, host, port, dialect });

    this.conn = new Sequelize({ database, password, username, host, port, dialect });

    try {
      await this.conn.authenticate();
      console.log('[Sequelize] Connection has been established successfully.');
    } catch (err: any) {
      console.log(`[Sequelize] Unable to authenticate to Database`, err.original);
      return null;
    }

    try {
      this.modelsInit();

      await this.conn.sync({ alter: true });

      // const models = Object.values(this.models);
      // models.forEach((model) => {
      //   model.sync({ alter: true });
      // });
    } catch (err) {
      this.conn = null;
      console.error('Unable to connect to the database:', err);
    }
    return null;
  };

  private modelsInit = () => {
    if (this.conn) {
      this.models[`${BotConfigModel.name}`] = BotConfigModel(this.conn);
    }
  };

  // checkIfServerExistsInDb = (guildId) => {};
}
