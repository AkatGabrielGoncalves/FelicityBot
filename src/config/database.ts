import { Dialect } from 'sequelize/types';
import Logger from '../logger/Logger';

export = {
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT as string),
  database: process.env.DB_NAME as string,
  username: process.env.DB_USERNAME as string,
  password: process.env.DB_PASSWORD as string,
  dialect: process.env.DB_DIALECT as Dialect,
  logging: (process.env.DB_LOGGING === 'FALSE'
    ? false
    : (msg: string) => Logger.debug(msg)) as boolean,
  define: {
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};
