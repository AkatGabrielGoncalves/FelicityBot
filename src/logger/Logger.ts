/* eslint-disable no-console */
import log4js from 'log4js';

import appe from './appenders/webhook';

// @ts-ignore
log4js.configure({
  appenders: {
    out: { type: 'console', layout: { type: 'pattern', pattern: '%d %p %c %m%n' } },
    webhook: { type: appe, timezoneOffset: '-3' },
  },
  categories: {
    default: { appenders: ['out', 'webhook'], level: 'debug', enableCallStack: true },
  },
});

const logger = log4js.getLogger();

export default logger;
