import log4js from 'log4js';
import webhook from '../Webhook';

function webhookAppender(layout: log4js.LayoutFunction, timezoneOffset: any) {
  return (loggingEvent: log4js.LoggingEvent) => {
    if (webhook) {
      // @ts-ignore
      webhook.addMessage(layout(loggingEvent, timezoneOffset));
    }
  };
}

function configure(config: log4js.Config, layouts: log4js.LayoutsParam) {
  let layout = layouts.patternLayout;

  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }

  return webhookAppender(layout, config.timezoneOffset);
}

export default { configure };
