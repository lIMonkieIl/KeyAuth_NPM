import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { isNotEmpty, length, isNumberString } from 'class-validator';
import Logger from '../keyauth_logger/logger';
const logger = new Logger('KeyAuthNPM');
import { execSync } from 'child_process';
import os from 'os';
import { Details } from './api';
import { Options } from '../../dist/keyauth_api/api';
import axios, { AxiosError } from 'axios';
var appDetails: Details;
var appOptions: Options;
export default class KeyAuthApi {
  public constructor(details: Details, options?: Options) {
    this._options = this._processOptions(options);
    this._details = this._checkDetails(details) as Details;
    appDetails = this._checkDetails(details) as Details;
    appOptions = this._processOptions(options);
    this.internalLog('info', {
      message: `KeyAuth npn package successfully loaded, for app: ${
        this._details.name
      } on api version: ${this._options.apiVer || 1.2}`,
    });
  }
  private _details: Details;
  private _options: Options;
  private _encKey: string;
  private _processOptions(options: Options | undefined): Options {
    if (!options) {
      options = { apiVer: '1.2', logs: true, useEncKey: true };
    }
    if (!options.apiVer) {
      options.apiVer = '1.2';
    }
    return options;
  }
  private _checkDetails(details: Details) {
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
      ? details
      : Helpers.Error(detailsErrors, 'ImportError', true);
  }
  private internalLog(
    level: 'error' | 'debug' | 'warn' | 'info',
    message: { message: string; optionalParams?: string },
  ) {
    if (this._options.logs) {
      logger.log(level, message);
    }
  }
  private _initailized: boolean;
  get data() {
    if (this._initailized) {
      return Data;
    }
    Helpers.Error(
      'You have not initialized keyauth please!',
      'InitError',
      true,
    );
    return undefined;
  }
  public async initialize(): Promise<{ success: boolean; message: string }> {
    this._encKey = createHash('sha256')
      .update(uuidv4().substring(0, 8))
      .digest('hex');
    const post_data: any = {
      type: 'init',
      ver: this._details.version,
      name: this._details.name,
      ownerid: this._details.ownerId,
      enckey: this._encKey,
    };
    const response = await Helpers.ApiRequest(this._options.apiVer!, post_data);
    const { success, message, sessionid, appinfo } = response;
    Data.sessionId = sessionid;
    Data.appInfo = appinfo;
    this._initailized = true;
    return { success, message };
  }
  public async register(
    username: string,
    password: string,
    key: string,
    hwid?: string,
  ): Promise<{ success: boolean; message: string }> {
    const post_data: any = {
      type: 'register',
      username: username,
      pass: password,
      key: key,
      hwid: hwid || Misc.get_hwid(),
      sessionid: Data.sessionId,
      name: this._details.name,
      ownerid: this._details.ownerId,
    };
    const response = await Helpers.ApiRequest(this._options.apiVer!, post_data);
    const { success, message, info } = response;
    if (success) {
      Data.info = info;
    }
    return { success, message };
  }
  public async login(
    username: string,
    password: string,
    hwid?: string,
  ): Promise<{ success: boolean; message: string }> {
    const post_data: any = {
      type: 'login',
      username: username,
      pass: password,
      hwid: hwid || Misc.get_hwid(),
      sessionid: Data.sessionId,
      name: this._details.name,
      ownerid: this._details.ownerId,
    };
    const response = await Helpers.ApiRequest(this._options.apiVer!, post_data);
    const { success, message, info } = response;
    if (success) {
      Data.info = info;
    }
    return { success, message };
  }
  public async upgrade(
    username: string,
    key: string,
  ): Promise<{ success: boolean; message: string }> {
    const post_data: any = {
      type: 'upgrade',
      username: username,
      key,
      sessionid: Data.sessionId,
      name: this._details.name,
      ownerid: this._details.ownerId,
    };
    const response = await Helpers.ApiRequest(this._options.apiVer!, post_data);
    const { success, message } = response;
    return { success, message };
  }
  public async license(
    key: string,
    hwid?: string,
  ): Promise<{ success: boolean; message: string }> {
    const post_data: any = {
      type: 'license',
      key,
      hwid: hwid || Misc.get_hwid(),
      sessionid: Data.sessionId,
      name: this._details.name,
      ownerid: this._details.ownerId,
    };
    const response = await Helpers.ApiRequest(this._options.apiVer!, post_data);
    const { success, message, info } = response;
    Data.info = info;
    return { success, message };
  }
  public async fetchOnline(): Promise<{ success: boolean; message: string }> {
    const post_data: any = {
      type: 'fetchOnline',
      sessionid: Data.sessionId,
      name: this._details.name,
      ownerid: this._details.ownerId,
    };
    const response = await Helpers.ApiRequest(this._options.apiVer!, post_data);
    const { success, message, users } = response;
    Data.users = users;
    return { success, message };
  }
  public var = {
    user: Var,
    global: async (
      varId: string,
    ): Promise<{ success: boolean; message: string; varData?: string }> => {
      const post_data: any = {
        type: 'var',
        varid: varId,
        sessionid: Data.sessionId,
        name: appDetails.name,
        ownerid: appDetails.ownerId,
      };
      const _response = await Helpers.ApiRequest(appOptions.apiVer!, post_data);
      const { success, message } = _response;
      if (success) {
        return {
          success,
          message: 'Successfully retrieved global variable.',
          varData: message,
        };
      } else {
        return { success, message };
      }
    },
  };
  public async checkBlacklist(hwid?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const post_data: any = {
      type: 'checkblacklist',
      hwid: hwid || Data.info.hwid || null,
      name: this._details.name,
      ownerid: this._details.ownerId,
      sessionid: Data.sessionId,
    };
    const response = await Helpers.ApiRequest(this._options.apiVer!, post_data);
    const { success, message } = response;
    return { success, message };
  }
}
class Var {
  static async set(varName: string, data: string) {
    const post_data: any = {
      type: 'setvar',
      var: varName,
      data,
      sessionid: Data.sessionId,
      name: appDetails.name,
      ownerid: appDetails.ownerId,
    };
    const response = await Helpers.ApiRequest(appOptions.apiVer!, post_data);
    const { success, message } = response;
    return { success, message };
  }

  static async get(
    varName: string,
  ): Promise<{ success: boolean; message: string; varData?: string }> {
    const post_data: any = {
      type: 'getvar',
      var: varName,
      sessionid: Data.sessionId,
      name: appDetails.name,
      ownerid: appDetails.ownerId,
    };
    const _response = await Helpers.ApiRequest(appOptions.apiVer!, post_data);
    const { success, message, response } = _response;
    if (success) {
      return { success, message, varData: response };
    } else {
      return { success, message };
    }
  }
}

class Data {
  private static _sessionsId: string;
  private static _users: { credential: string }[];
  static set users(users: { credential: string }[]) {
    this._users = users;
  }
  static get users() {
    return this._users;
  }
  static get sessionId() {
    return this._sessionsId;
  }
  static set sessionId(id: string) {
    this._sessionsId = id;
  }
  private static _info: {
    username: string;
    subscriptions: {
      subscription: string;
      key: string;
      expiry: string;
      timeleft: string;
    }[];
    ip: string;
    hwid: string;
    lastlogin: string;
  } = {
    username: 'Not Logged in',
    hwid: 'Not Logged in',
    ip: 'Not Logged in',
    lastlogin: 'Not Logged in',
    subscriptions: [
      {
        expiry: 'Not Logged in',
        key: 'Not Logged in',
        subscription: 'Not Logged in',
        timeleft: 'Not Logged in',
      },
    ],
  };
  static get info() {
    return this._info;
  }
  static set info(info: {
    username: string;
    subscriptions: {
      subscription: string;
      key: string;
      expiry: string;
      timeleft: string;
    }[];
    ip: string;
    hwid: string;
    lastlogin: string;
  }) {
    this._info = info;
  }
  private static _appInfo: {
    numUsers: number;
    numOnlineUsers: number;
    numKeys: number;
    version: string;
    customerPanelLink: string;
  };
  static get appInfo() {
    return this._appInfo;
  }
  static set appInfo(appInfo: {
    numUsers: number;
    numOnlineUsers: number;
    numKeys: number;
    version: string;
    customerPanelLink: string;
  }) {
    this._appInfo = appInfo;
  }
}

class Helpers {
  static Error(message: any, param: string, exit: boolean) {
    logger.error(message, param);
    if (exit) {
      logger.error('process.exit(0) was called as there was an error!', 'Exit');
      process.exit(0);
    }
  }
  static async ApiRequest(version: string, postData: any): Promise<any> {
    const response = await axios({
      method: 'POST',
      url: `https://keyauth.win/api/${version}/`,
      data: new URLSearchParams(postData).toString(),
    });
    if (response instanceof AxiosError) {
      console.log('ERROR');
      console.log(response.message);
    }
    return response.data;
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
