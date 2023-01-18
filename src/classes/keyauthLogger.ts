import { logger } from '../utils/logger';
export default class Log {
  static error(message: any, param?: string) {
    logger.error({ message, optionalParams: param });
  }
  static warn(message: any, param?: string) {
    logger.warn({ message, optionalParams: param });
  }
  static info(message: any, param?: string) {
    logger.info({ message, optionalParams: param });
  }
  static debug(message: any, param?: string) {
    logger.debug({ message, optionalParams: param });
  }
}
