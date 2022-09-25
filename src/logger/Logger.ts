/* eslint-disable no-console */
import log4js from 'log4js';

import appe from './appenders/webhook';

const pattern = '%[[%p]%][%d][%f{1}:%l]:%m';

// @ts-ignore
log4js.configure({
  appenders: {
    out: { type: 'console', layout: { type: 'pattern', pattern } },
    webhook: {
      type: appe,
      timezoneOffset: '-3',
      layout: { type: 'pattern', pattern },
    },
  },
  categories: {
    default: { appenders: ['out', 'webhook'], level: 'debug', enableCallStack: true },
  },
});

const Logger = log4js.getLogger();

export default Logger;
