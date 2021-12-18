/* eslint-disable no-console */
import { MongoClient, Collection } from 'mongodb';

class MongoDB extends MongoClient {
  private logs: Collection<any> | null;

  private static connUri = process.env.MONGODB_URI as string;

  constructor() {
    super(MongoDB.connUri);
    this.logs = null;
    this.connectToMongo();
  }

  private connectToMongo = async () => {
    await this.connect();
    console.log('[\x1b[36mINFO\x1b[0m]: Connection to MongoDB established.');
    this.logs = this.db('felicity_bot_logs').collection('logs');
    this.logs.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
  };

  sendLog = async (
    type: 'ERROR' | 'WARN' | 'DEBUG' | 'INFO',
    message: string,
    err: Error,
    extra: any = ''
  ) => {
    try {
      await this.logs?.insertOne({
        type,
        message,
        err: err.stack,
        extra,
        date: new Date(),
        expireAt: new Date(Date.now() + 7776000000),
      });
    } catch (error) {
      console.log(error);
    }
  };
}

const createClass = () => {
  if (process.env.MONGODB_USE === 'TRUE') {
    return new MongoDB();
  }
  return null;
};

export default createClass();
