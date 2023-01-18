import { KeyAuthDetails, KeyAuthOptions } from './types';
import { v4 as uuidv4 } from 'uuid';
import { createHash, createCipheriv, createDecipheriv } from 'crypto';
import { execSync } from 'child_process';
import axios from 'axios';
import os from 'os';
import { isNotEmpty, length, isNumberString } from 'class-validator';
import { logger } from './logger';
export default class KeyAuth {
  public constructor(details: KeyAuthDetails, options?: KeyAuthOptions) {
    this._checkDetails(details);
    this._details = details;
    this._options = options || { apiVer: '1.2', useEncKey: true };
  }
  private _details: KeyAuthDetails;
  private _options: KeyAuthOptions;
  private _enckey: string;
  private _sessionId: string;
  private _initialized: boolean = false;
  private _error(
    message: string | string[],
    param: string,
    exit: boolean = false,
  ) {
    logger.error({ message, optionalParams: param });
    if (exit) {
      logger.error('process.exit(0); was called because of an error!');
      process.exit(0);
    }
  }
  private _checkDetails(details: KeyAuthDetails) {
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
    return detailsErrors.length === 0
      ? null
      : this._error(detailsErrors, 'ImportError', true);
  }
  private async _make_request(data: any) {
    return new Promise(async resolve => {
      const request = await axios({
        method: 'POST',
        url: `https://keyauth.win/api/${this._options.apiVer}/`,
        data: new URLSearchParams(data).toString(),
      }).catch(err => {
        console.log(err);
      });

      if (request && request.data) {
        resolve(request.data);
      } else {
        resolve(null);
      }
    });
  }
  public initialize = () =>
    new Promise(async resolve => {
      this._enckey = createHash('sha256')
        .update(uuidv4().substring(0, 8))
        .digest('hex');
      const init_iv = createHash('sha256')
        .update(uuidv4().substring(0, 8))
        .digest('hex');

      const post_data = this._options.useEncKey
        ? {
            type: Buffer.from('init').toString('hex'),
            ver: Encryption.encrypt(
              this._details.version,
              this._details.secret,
              init_iv,
            ),
            enckey: Encryption.encrypt(
              this._enckey,
              this._details.secret,
              init_iv,
            ),
            name: Buffer.from(this._details.name).toString('hex'),
            ownerid: Buffer.from(this._details.ownerId).toString('hex'),
            init_iv: init_iv,
          }
        : {
            type: Buffer.from('init').toString('hex'),
            ver: Encryption.encrypt(
              this._details.version,
              this._details.secret,
              init_iv,
            ),
            name: Buffer.from(this._details.name).toString('hex'),
            ownerid: Buffer.from(this._details.ownerId).toString('hex'),
            init_iv: init_iv,
          };

      const response = await this._make_request(post_data);
      const decrypted = Encryption.decrypt(
        response,
        this._details.secret,
        init_iv,
      );

      const parsed = JSON.parse(decrypted);

      if (!parsed.success || parsed.success == false) {
        return resolve(false);
      }

      this._sessionId = parsed.sessionid;
      this._initialized = true;

      resolve(parsed);
    });
}
class Encryption {
  static encrypt(message: any, enc_key: any, iv: any) {
    try {
      const _key = createHash('sha256')
        .update(enc_key)
        .digest('hex')
        .substring(0, 32);

      const _iv = createHash('sha256')
        .update(iv)
        .digest('hex')
        .substring(0, 16);

      return this.encrypt_string(message, _key, _iv);
    } catch (err) {
      console.log(err);
      console.log(
        'Invalid Application Information. Long text is secret short text is ownerid. Name is supposed to be app name not username',
      );
      process.exit(1);
    }
  }

  static encrypt_string(plain_text: any, key: any, iv: any) {
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let crypted = cipher.update(plain_text, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  }

  static decrypt(message: any, key: any, iv: any) {
    try {
      const _key = createHash('sha256')
        .update(key)
        .digest('hex')
        .substring(0, 32);

      const _iv = createHash('sha256')
        .update(iv)
        .digest('hex')
        .substring(0, 16);

      return this.decrypt_string(message, _key, _iv);
    } catch (err) {
      console.log(err);

      console.log(
        'Invalid Application Information. Long text is secret short text is ownerid. Name is supposed to be app name not username',
      );
      process.exit(1);
    }
  }

  static decrypt_string(cipher_text: any, key: any, iv: any) {
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(cipher_text, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }
}
class Misc {
  static get_hwid() {
    if (os.platform() != 'win32') return false;

    const cmd = execSync(
      'wmic useraccount where name="%username%" get sid',
    ).toString('utf-8');

    const system_id = cmd.split('\n')[1].trim();
    return system_id;
  }
}
