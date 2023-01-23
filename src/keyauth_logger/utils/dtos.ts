class BaseOptions {
  level?: 'info' | 'debug' | 'error' | 'warn';
  silent?: boolean;
}
class WebHookOptions extends BaseOptions {
  id: string;
  token: string;
  username?: string;
  avatar_url?: string;
}
class FileOptions extends BaseOptions {}
class ConsoleOptions extends BaseOptions {}

export class LoggerConfigOptions {
  silent?: boolean;
  fileRotationSilent?: boolean;
  WebhookSilent?: boolean;
  application: string;
  console?: ConsoleOptions;
  file?: FileOptions;
  webhook?: WebHookOptions;
}
