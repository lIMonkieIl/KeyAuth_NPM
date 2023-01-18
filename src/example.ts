import KeyAuth, { KeyAuthDetails, KeyAuthOptions } from './index';

const keyAuthDetails: KeyAuthDetails = {
  name: '',
  ownerId: '',
  secret: '',
  version: '',
};

const keyAuthOptions: KeyAuthOptions = {
  apiVer: '1.2',
  logs: true,
  useEncKey: true,
};

const keyAuthApp = new KeyAuth(keyAuthDetails, keyAuthOptions);
export default async function main() {
  const { success, message } = await keyAuthApp.initialize();
  if (!success) {
    console.log(message);
    process.exit(0);
  }
  console.log(message);
}
main();
