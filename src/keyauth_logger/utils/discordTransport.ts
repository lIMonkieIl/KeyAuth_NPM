import Transport, { TransportStreamOptions } from 'winston-transport';
import axios, { Axios, isAxiosError, AxiosRequestConfig } from 'axios';
import winston from 'winston';
import { capitalizeFirstLetter } from './formaters';
interface Options extends TransportStreamOptions {
  internalLog: winston.Logger;
  id: string;
  token: string;
  username?: string;
  avatar_url?: string;
}
interface Info {
  application: string;
  level: string;
  message?: any;
}
export default class DiscordTransport extends Transport {
  public constructor(options: Options) {
    super(options);
    this.options = options;
  }
  private options: Options;
  private info: Info & {
    optionalParams: string;
  };
  private formatDate(): string {
    function getTimestampInSeconds() {
      return Math.floor(Date.now() / 1000);
    }
    return `📅  **Happened:** <t:${getTimestampInSeconds()}:R>`; //`**Date:** [\`\`${this.date.toLocaleDateString()}-${this.date.toLocaleTimeString()}:${this.date.getMilliseconds()}\`\`]`
  }
  private formateMessage(): string {
    var data = this.info.message.stack
      ? this.info.message.stack
      : this.info.message;
    if (typeof data === 'object') data = JSON.stringify(data);
    var level = `📶   **Level:** \`\`${this.info.level.toUpperCase()}\`\``;
    var app = this.info.optionalParams
      ? `🖥️  **Application:** \`\`${capitalizeFirstLetter(
          this.info.application,
        )}/${capitalizeFirstLetter(this.info.optionalParams)}\`\``
      : `🖥️  **Application:** \`\`${capitalizeFirstLetter(
          this.info.application,
        )}\`\``;
    var message = `\`\`\`${data}\`\`\``;
    return `${this.formatDate()}  |  ${app}  |  ${level} ${message}`;
  }
  private getLevelColor(): number {
    let color: number = 0xfbfcfc;
    switch (this.info.level) {
      case 'error':
        color = 0xff0000;
        break;
      case 'info':
        color = 0x45ff00;
        break;
      case 'warn':
        color = 0xffff00;
        break;

      case 'debug':
        color = 0xffa500;
        break;
    }
    return color;
  }
  private sender = async (request: any) =>
    await axios
      .post(
        `https://discord.com/api/webhooks/${this.options.id}/${this.options.token}`,
        request,
      )
      .then(data => data)
      .catch(error => error);
  private async newLogEmbed() {
    var description = this.formateMessage();
    if (description.length >= 4004) {
      description = description.substring(0, 4004);
      description += '```';
    }
    if (this.info.level === 'debug') {
      description +=
        '\n**Note:** *Make sure to set webhook level to ``info`` in release, to not see this message.*';
    }
    const request = {
      username: this.options.username,
      avatar_url: this.options.avatar_url,
      embeds: [
        {
          title: `New Log`,
          color: this.getLevelColor(),
          description,
          timestamp: new Date().toISOString(),
          footer: {
            text: `${capitalizeFirstLetter(this.info.application)} - Logs`,
          },
        },
      ],
    };
    const sender = await this.sender(request);
    if (isAxiosError(sender)) {
      switch (sender.response?.status) {
        case 429:
          return setTimeout(async () => {
            const senderRetry = await this.sender(request);
            if (isAxiosError(senderRetry)) {
              return this.options.internalLog.error({
                message: senderRetry.toJSON(),
                optionalParams: 'WebhookError',
              });
            } else {
              return this.options.internalLog.debug({
                message: `Successfully sent new webhook log to:`,
                webhook: sender.request.res.responseUrl,
                optionalParams: 'Webhook',
              });
            }
          }, sender.response?.data.retry_after * 10 * 1000);
        default:
          return this.options.internalLog.error({
            message: sender.toJSON(),
            optionalParams: 'WebhookError',
          });
      }
    } else {
      return this.options.internalLog.debug({
        message: `Successfully sent new webhook log to:`,
        webhook: sender.request.res.responseUrl,
        optionalParams: 'Webhook',
      });
    }
    // var retry: number = sender.response?.data?.retry_after;
    // if (typeof retry === 'number') {
    //   setTimeout(async () => await this.sender(request), retry * 10 * 1000);
    // }

    // await axios
    //   .post(link, request)
    //   .then(data => {
    //     if (data.status === 204) {
    //       return this.options.internalLog.debug({
    //         message: `Successfully sent new webhook log to:`,
    //         webhook: link,
    //         optionalParams: 'Webhook',
    //       });
    //     }
    //   })
    //   .catch(error => {
    //     console.log(error.response.data.retry_after);
    //     return this.options.internalLog.error({
    //       message: error,
    //       optionalParams: 'WebhookError',
    //     });
    //   });
  }
  async log(info: any, callback: any) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    this.info = info;
    await this.newLogEmbed();
    callback();
  }
}
