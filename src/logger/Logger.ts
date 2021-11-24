/* eslint-disable no-console */
import { performance } from 'perf_hooks';

type LogType = 'ERROR' | 'WARN' | 'DEBUG' | 'INFO';

class Logger {
  private logs: Map<string, number>;

  private logText: {
    ERROR: (message: string, err: Error, extra: any) => string;
    WARN: (message: string, err: Error, extra: any) => string;
    DEBUG: (message: string, err: Error, extra: any) => string;
    INFO: (message: string, err: Error, extra: any) => string;
  };

  constructor() {
    this.logs = new Map();
    this.logText = {
      ERROR: (message: string, err: Error, extra: any) =>
        `[\x1b[1m\x1b[31mERROR\x1b[0m]: ${message} Extra: ${JSON.stringify(extra)}; Stack: (${
          err.stack
        })`,
      WARN: (message: string, err: Error, extra: any) =>
        `[\x1b[33mWARN\x1b[0m]: ${message} Extra: ${JSON.stringify(extra)}; Stack: (${
          /\/.+?:\d*:\d*/.exec(err.stack as string)![0]
        })`,
      DEBUG: (message: string, err: Error, extra: any) =>
        `[\x1b[1m\x1b[35mDEBUG\x1b[0m]: ${message} Extra: ${JSON.stringify(extra)}; Stack: (${
          /\/.+?:\d*:\d*/.exec(err.stack as string)![0]
        })`,
      INFO: (message: string, err: Error, extra: any) =>
        `[\x1b[36mINFO\x1b[0m]: ${message} Extra: ${JSON.stringify(extra)}; Stack: (${
          /\/.+?:\d*:\d*/.exec(err.stack as string)![0]
        })`,
    };
  }

  start = (name: string, type: LogType, message: string, err: Error, extra: any = '') => {
    const log = this.logText[type](message, err, extra);
    console.log(log);
    this.logs.set(name, performance.now());
  };

  finish = (name: string, type: LogType, message: string, err: Error, extra: any = '') => {
    const log = this.logText[type](message, err, {
      executionTime: performance.now() - (this.logs.get(name) as number),
      ...extra,
    });
    console.log(log);
    this.logs.delete(name);
  };

  log = (type: LogType, message: string, err: Error, extra: any = '') => {
    if (type === 'DEBUG' && process.env.DEBUG_MODE === 'TRUE') {
      return;
    }
    const log = this.logText[type](message, err, extra);
    console.log(log);
  };
}

const logger = new Logger();

export default logger;