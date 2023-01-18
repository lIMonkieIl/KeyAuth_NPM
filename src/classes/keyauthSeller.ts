import axios, { AxiosResponse } from 'axios';
import { Seller } from '../types/index.ts';
import { logger } from '../utils/logger';
export default class KeyAuthSeller {
  constructor(details: Seller.Details, options?: Seller.Options) {
    Data.details = details;
  }
  public async initialize(): Promise<{ success: boolean; message: string }> {
    return Helpers.Get('', Data.details.sellerKey);
  }
  users = {
    async all(): Promise<any> {
      const allUsers = await Helpers.Get(
        'type=fetchallusers',
        Data.details.sellerKey,
      );
      return allUsers;
    },
  };
}

class Helpers {
  static Error(
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
  static async Get(
    url: string,
    sellerKey: string,
  ): Promise<{ success: boolean; message: string }> {
    return new Promise(async resolve => {
      const request = await axios({
        method: 'GET',
        url: 'https://keyauth.win/api/seller',
        params: {
          sellerkey: sellerKey,
          type: 'setseller',
        },
      })
        .then(data => {
          return data.data;
        })
        .catch(err => {
          return err.response.data;
        });
      if (request.success) {
        resolve(request);
      } else {
        this.Error(request, 'Seller', true);
      }
    });
  }
}

class Data {
  static details: Seller.Details;
  get details(): Seller.Details {
    return this.details;
  }
  set details(details: Seller.Details) {
    this.details = details;
  }
}
