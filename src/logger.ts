import winston, { format } from 'winston';
const { combine, timestamp, label, prettyPrint } = format;
import {
  yellow,
  yellowBright,
  magenta,
  blue,
  green,
  red,
  whiteBright,
} from 'chalk';
function capitalizeFirstLetter(string: string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}
const formatMeta = (meta: any) => {
  // You can format the splat yourself
  const splat = meta[Symbol.for('splat')];
  if (splat && splat.length) {
    return splat.length === 1 ? splat[0] : splat;
  }
  return '';
};
const enumerateErrorFormat = format(info => {
  const opts = formatMeta(info);
  if (info.message instanceof Error) {
    info.message = Object.assign(
      {
        message: info.message.message,
        stack: info.message.stack,
      },
      info.message,
    );
  }

  if (info instanceof Error) {
    return Object.assign(
      {
        message: info.message,
        stack: info.stack,
      },
      info,
    );
  }
  if (info.message?.webhook) {
    return Object.assign(
      {
        webhook: info.message.webhook,
      },
      info,
    );
  }
  if (opts) {
    return Object.assign(
      {
        optionalParams: opts,
      },
      info,
    );
  }
  return info;
});
function consoleFormat() {
  return format.printf(
    ({ level, message, application, webhook, optionalParams }) => {
      let date = new Date();

      let timestamp = `[${yellow(date.toLocaleDateString())} - ${yellowBright(
        `${date.toLocaleTimeString()}:${date.getMilliseconds()}`,
      )}]`;
      application = optionalParams
        ? `[${magenta(capitalizeFirstLetter(application))}/${magenta(
            optionalParams,
          )}]`
        : `[${magenta(capitalizeFirstLetter(application))}]`;
      switch (level.toLowerCase()) {
        case 'debug':
          level = `[${blue(level.toUpperCase())}]:`;
          message =
            typeof message === 'object'
              ? (message = blue(JSON.stringify(message)))
              : blue(message);
          break;
        case 'info':
          level = `[${green(level.toUpperCase())}]:`;
          message =
            typeof message === 'object'
              ? (message = green(JSON.stringify(message)))
              : green(message);
          break;
        case 'warn':
          level = `[${yellow(level.toUpperCase())}]:`;
          message =
            typeof message === 'object'
              ? (message = yellow(JSON.stringify(message)))
              : yellow(message);
          break;
        case 'error':
          level = `[${red(level.toUpperCase())}]:`;
          message = message.stack
            ? message.stack
            : typeof message === 'string'
            ? message
            : '\n' + message.join(',\n');
          message = red(message);
          break;
      }

      let response = `${timestamp} ${application} ${level} ${message}`;

      if (webhook) response += `\n${whiteBright.dim(webhook)}`;
      return response;
    },
  );
}

export const logger = winston.createLogger({
  level: 'debug',
  defaultMeta: { application: 'KeyAuthNPM' },
  format: format.combine(format.splat(), enumerateErrorFormat()),
  transports: [new winston.transports.Console({ format: consoleFormat() })],
});
