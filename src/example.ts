import KeyAuth, { KeyAuthDetails, KeyAuthOptions } from './index';

const keyAuthDetails: KeyAuthDetails = {
  name: '',
  ownerId: '',
  secret: '',
  version: '',
};

const keyAuthOptions: KeyAuthOptions = {
  apiVer: '',
  useEncKey: true,
};

const keyauthApp = new KeyAuth(keyAuthDetails, keyAuthOptions);
export default function main() {
  console.log('Started');
}
main();
