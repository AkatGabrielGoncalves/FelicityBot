import { Dialect } from 'sequelize/types';

export = {
  host: process.env.DBHOST as string,
  port: Number(process.env.DBPORT as string),
  database: process.env.DBNAME as string,
  username: process.env.DBUSERNAME as string,
  password: process.env.DBPASSWORD as string,
  dialect: process.env.DBDIALECT as Dialect,
};
