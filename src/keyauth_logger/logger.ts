import winston, { format } from 'winston';
import DiscordTransport from './utils/discordTransport';
import 'winston-daily-rotate-file';
import { LoggerConfigOptions } from './utils/dtos';
import {
  consoleFormat,
  enumerateErrorFormat,
  rotationFormat,
} from './utils/formaters';
export default class Logger {
  public constructor(loggerConfig?: LoggerConfigOptions | string) {
    this._options = this._genConfig(loggerConfig);
    this._logger = this._create();
  }
  private _logger: winston.Logger;
  private _options: LoggerConfigOptions;
  private _genConfig(
    config: LoggerConfigOptions | undefined | string,
  ): LoggerConfigOptions {
    if (typeof config === 'string') {
      return {
        application: config,
      };
    }
    if (typeof config === 'undefined') {
      return { application: 'Logger' };
    }
    return config;
  }
  private internalLog(internal: 'webhook' | 'file') {
    switch (internal) {
      case 'file':
        return winston.createLogger({
          defaultMeta: { application: this._options.application },
          silent: this._options.silent,
          level: 'debug',
          format: format.combine(format.splat(), enumerateErrorFormat()),
          transports: [
            new winston.transports.Console({
              level: 'debug',
              silent: this._options.fileRotationSilent,
              format: consoleFormat(),
            }),
          ],
        });

      case 'webhook':
        return winston.createLogger({
          defaultMeta: { application: this._options.application },
          silent: this._options.silent,
          level: 'debug',
          format: format.combine(format.splat(), enumerateErrorFormat()),
          transports: [
            new winston.transports.Console({
              level: 'debug',
              silent: this._options.WebhookSilent,
              format: consoleFormat(),
            }),
          ],
        });
    }
  }

  private _create(): winston.Logger {
    const internalLog = this.internalLog('file');
    const logger = winston.createLogger({
      defaultMeta: { application: this._options.application },
      silent: this._options.silent,
      level: 'debug',

      format: format.combine(format.splat(), enumerateErrorFormat()),
      transports: [
        new winston.transports.Console({
          level: this._options.console?.level ?? 'debug',
          silent: this._options.console?.silent,
          format: consoleFormat(),
        }),
      ],
    });

    if (this._options.webhook) {
      const webhookTransport = new DiscordTransport({
        internalLog: this.internalLog('webhook'),
        avatar_url:
          this._options.webhook.avatar_url ??
          'https://png.pngtree.com/png-vector/20190409/ourlarge/pngtree-log-file-document-icon-png-image_923136.jpg',
        id: this._options.webhook.id,
        token: this._options.webhook.token,
        username: this._options.webhook.username ?? 'BotLogger',
        level: this._options.webhook.level || 'debug',
        silent: this._options.webhook.silent,
      });
      logger.add(webhookTransport);
    }

    if (this._options.file) {
      const dailyRotateFileTransportError =
        new winston.transports.DailyRotateFile({
          silent: this._options?.file.silent,
          level: 'error',
          zippedArchive: true,
          dirname: `./logs/${this._options?.application}`,
          filename: 'error-%DATE%.log',
          maxFiles: '1d',
          format: format.combine(winston.format.json(), rotationFormat),
        });
      const dailyRotateFileTransportCombined =
        new winston.transports.DailyRotateFile({
          level: this._options?.file.level,
          silent: this._options?.file?.silent,
          zippedArchive: true,
          dirname: `./logs/${this._options?.application}`,
          filename: 'combined-%DATE%.log',
          watchLog: true,
          maxFiles: '1d',
          format: format.combine(winston.format.json(), rotationFormat),
        });
      dailyRotateFileTransportError.on('new', function (newFilename: any) {
        internalLog.debug({
          message: `New log file created: ${newFilename}`,
          optionalParams: 'FileRotation',
        });
      });
      dailyRotateFileTransportError.on(
        'rotate',
        function (oldFilename: any, newFilename: any) {
          internalLog.debug({
            message: `New log rotation from: ${oldFilename} to: ${newFilename}`,
            optionalParams: 'FileRotation',
          });
        },
      );
      dailyRotateFileTransportError.on('archive', function (zipFilename: any) {
        internalLog.debug({
          message: `Log file has been archived: ${zipFilename}`,
          optionalParams: 'FileRotation',
        });
      });
      dailyRotateFileTransportError.on(
        'logRemoved',
        function (removedFilename: any) {
          internalLog.debug({
            message: `Log file was deleted: ${removedFilename}`,
            optionalParams: 'FileRotation',
          });
        },
      );
      dailyRotateFileTransportCombined.on('new', function (newFilename: any) {
        internalLog.debug({
          message: `New log file created: ${newFilename}`,
          optionalParams: 'FileRotation',
        });
      });
      dailyRotateFileTransportCombined.on(
        'rotate',
        function (oldFilename: any, newFilename: any) {
          internalLog.debug({
            message: `New log rotation from: ${oldFilename} to: ${newFilename}`,
            optionalParams: 'FileRotation',
          });
        },
      );
      dailyRotateFileTransportCombined.on(
        'archive',
        function (zipFilename: any) {
          internalLog.debug({
            message: `Log file has been archived: ${zipFilename}`,
            optionalParams: 'FileRotation',
          });
        },
      );
      dailyRotateFileTransportCombined.on(
        'logRemoved',
        function (removedFilename: any) {
          internalLog.debug({
            message: `Log file was deleted: ${removedFilename}`,
            optionalParams: 'FileRotation',
          });
        },
      );
      logger.add(dailyRotateFileTransportCombined);
      logger.add(dailyRotateFileTransportError);
    }

    return logger;
  }
  public error = (message: any, meta?: any) =>
    this._logger.error(message, meta);
  public warn = (message: any, meta?: any) => this._logger.warn(message, meta);
  public info = (message: any, meta?: any) => this._logger.info(message, meta);
  public debug = (message: any, meta?: any) =>
    this._logger.debug(message, meta);
  public log = (level: any, message: any) => this._logger.log(level, message);
}
