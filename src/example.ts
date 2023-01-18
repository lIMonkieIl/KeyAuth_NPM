import KeyAuth, { Api, Seller } from './index';
const sellerDetails: Seller.Details = {
  sellerKey: '',
};
const sellerOptions: Seller.Options = {
  logs: true,
};
const keyAuthSeller = new KeyAuth.Seller(sellerDetails, sellerOptions);
export default async function main() {
  const initSeller = await keyAuthSeller.initialize();
  KeyAuth.log.info(initSeller, 'Seller');
}
main();
