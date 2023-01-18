import KeyAuth from './keyauth';

const keyauthApp = new KeyAuth({
  name: '',
  ownerId: '',
  secret: '',
  version: '',
});
export default function main() {
  console.log('Started');
}
main();
