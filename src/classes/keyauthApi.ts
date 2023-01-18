import { Api } from '../types/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import axios from 'axios';
import { isNotEmpty, length, isNumberString } from 'class-validator';
import { logger } from '../utils/logger';
export default class KeyAuthApi {
  public constructor(details: Api.Details, options?: Api.Options) {
    this._options = options
      ? options
      : { apiVer: '1.2', logs: true, useEncKey: true };
    this._checkDetails(details);
    this._details = details;

    this.internalLog(
      'debug',
      `KeyAuth npn package successfully initialized, for app: ${
        this._details.name
      } on api version: ${this._options.apiVer || 1.2}`,
    );
  }
  private _details: Api.Details;
  private _options: Api.Options;
  private baseApiVer = '1.2';
  private _encKey: string;
  private _sessionId: string;
  private _initialized: boolean = false;
  private _error(
    message: string | string[],
    param: string,
    exit: boolean = false,
  ) {
    logger.error({ message, optionalParams: param });
    if (exit) {
      logger.error('process.exit(0); was called because of an error!', 'Exit');
      process.exit(0);
    }
  }
  private _checkDetails(details: Api.Details) {
    const detailsErrors: string[] = [];
    if (!isNotEmpty(details.name)) {
      detailsErrors.push('❌ Name can not be empty');
    }
    if (!isNotEmpty(details.ownerId)) {
      detailsErrors.push('❌ OwnerId can not be empty');
    }
    if (!length(details.ownerId, 10, 10)) {
      detailsErrors.push(`❌ OwnerId's are only 10 characters in length`);
    }
    if (!isNotEmpty(details.secret)) {
      detailsErrors.push('❌ Secret can not be empty');
    }
    if (!length(details.secret, 64, 64)) {
      detailsErrors.push(`❌ Secrets are only 64 characters in length`);
    }
    if (!isNotEmpty(details.version)) {
      detailsErrors.push('❌ Version can not be empty');
    }
    if (!isNumberString(details.version)) {
      detailsErrors.push('❌ Version must be of type NumberString');
    }
    if (this._options.apiVer === '1.0') {
      detailsErrors.push(
        '❌ This api version is not supported by this package!',
      );
    }
    return detailsErrors.length === 0
      ? null
      : this._error(detailsErrors, 'ImportError', true);
  }
  private async _make_request(data: any) {
    let url = `https://keyauth.win/api/${
      this._options.apiVer || this.baseApiVer
    }/`;
    console.log(url);
    return new Promise(async resolve => {
      const request = await axios({
        method: 'POST',
        url: url,
        data: new URLSearchParams(data).toString(),
      })
        .then(data => {
          return data;
        })
        .catch(err => {
          console.log(err);
        });
      if (request && request.data) {
        resolve(request.data);
      } else {
        resolve(null);
      }
    });
  }
  private internalLog(
    level: 'error' | 'debug' | 'warn' | 'info',
    message: string,
  ) {
    if (this._options.logs) {
      logger.log(level, { message, optionalParams: 'Logs' });
    }
  }
  public async initialize(): Promise<{ success: boolean; message: string }> {
    this._encKey = createHash('sha256')
      .update(uuidv4().substring(0, 8))
      .digest('hex');
    const post_data = {
      type: 'init',
      ver: this._details.version,
      name: this._details.name,
      ownerid: this._details.ownerId,
      enckey: this._encKey,
    };
    const response = await this._make_request(post_data);
    const parsed = JSON.parse(JSON.stringify(response));
    if (!parsed.success || parsed.success == false) {
      let message;
      if (typeof parsed === 'string') {
        message = parsed;
      } else {
        message = parsed.message;
      }
      switch (message) {
        case 'KeyAuth_Invalid':
          this._error('Application not found', 'InitError', true);
          break;
        case "This program hash does not match, make sure you're using latest version":
          this._error(
            'Please disable program hash you can do that by visiting this link: https://keyauth.win/app/?page=app-settings',
            'InitError',
            true,
          );
          break;
        default:
          return { success: false, message: parsed.message || parsed };
      }
    }

    this._sessionId = parsed.sessionid;
    this._initialized = true;

    return { success: true, message: parsed.message };
  }
}
