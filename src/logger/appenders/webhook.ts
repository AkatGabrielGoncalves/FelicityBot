import log4js from 'log4js';
import webhook from '../Webhook';

function stdoutAppender(layout: log4js.LayoutFunction, timezoneOffset: any) {
  return (loggingEvent: log4js.LoggingEvent) => {
    if (webhook) {
      // @ts-ignore
      webhook.addMessage(layout(loggingEvent, timezoneOffset));
    }
  };
}

// stdout configure doesn't need to use findAppender, or levels
function configure(config: log4js.Config, layouts: log4js.LayoutsParam) {
  let layout = layouts.patternLayout;

  if (config.layout) {
    // load the layout
    layout = layouts.layout(config.layout.type, config.layout);
  }

  return stdoutAppender(layout, config.timezoneOffset);
}

export default { configure };
