/* eslint-disable import/first */
/* eslint-disable no-console */
import { install } from 'source-map-support';

install();

import log4js from 'log4js';
import webhook from './appenders/webhook';

// @ts-ignore
log4js.configure({
  appenders: {
    out: { type: 'console', layout: { type: 'pattern', pattern: '%[[%p]%][%d][%f{1}:%l]:%m' } },
    webhook: {
      type: webhook,
      timezoneOffset: '-3',
      layout: { type: 'pattern', pattern: '[%p][%d][%f{1}:%l]:%m' },
    },
  },
  categories: {
    default: { appenders: ['out', 'webhook'], level: 'debug', enableCallStack: true },
  },
});

const Logger = log4js.getLogger();
Logger.level = process.env.DEBUG_MODE === 'TRUE' ? 'DEBUG' : 'INFO';

export default Logger;
