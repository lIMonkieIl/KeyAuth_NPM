## COMING SOON
This project is not finished in any way and will be coming soon it will include both the normal API and the SellerApi (will require a seller subscription)

# Some bonus Features that will be added
• Check is strong password validation function
```typescript
 if (!KeyAuth.IsStrongPw('PasswordToCheck', {
      minLength: 5,
      minLowercase: 2,
      minNumbers: 2,
      minSymbols: 2,
      minUppercase: 2,
    })
  ) {
    console.log('Password validation failed');
  }
```

## KeyAuth NPM package

### API 
```typescript

import KeyAuth, { Api } from 'keyauth';

const apiDetails: Api.Details = {
  name: '',
  ownerId: '',
  secret: '',
  version: '',
};
// (OPTIONAL)
const apiOptions: Api.Options = {
  apiVer: '1.2', // Default (latest version)
  logs: true, // show/hide logs default(true)
  useEncKey: true,  // Default (true)
};

const keyAuthApi = new KeyAuth.Api(apiDetails, apiOptions);
export default async function main() {
    const { success } = await keyAuthApi.initialize();
  if (success) {
    // Continue work
  } else {
    // Stop work
  }

}
main();

```
### Seller
```typescript

import KeyAuth, { Seller } from 'keyauth';

const sellerDetails: Seller.Details = {
  sellerKey: '',
};
// (OPTIONAL) 
const sellerOptions: Seller.Options = {
  logs: true,  // show/hide logs default(true)
};

const keyAuthApi = new KeyAuth.Api(apiDetails, apiOptions);
export default async function main() {
    const { success } =  await keyAuthSeller.initialize();
  if (success) {
    // Continue work
  } else {
    // Stop work
  }

}
main();

```
## Logger
```typescript
import KeyAuth from 'keyauth';
export default async function main() {
  KeyAuth.log.info('info message', 'Main')
  /*
  output: [18/01/2023 - 15:12:18:722] [KeyAuthNPM/Main] [INFO]: info message
  */
  KeyAuth.log.warn('warn message', 'Main')
    /*
  output: [18/01/2023 - 15:12:18:722] [KeyAuthNPM/Main] [WARN]: warn message
  */
  KeyAuth.log.debug('debug message', 'Main')
    /*
  output: [18/01/2023 - 15:12:18:722] [KeyAuthNPM/Main] [DEBUG]: debug message
  */
  KeyAuth.log.error('error message', 'Main')
    /*
  output: [18/01/2023 - 15:12:18:722] [KeyAuthNPM/Main] [ERROR]: error message
  */
}
main()
```

## Copyright License

KeyAuth is licensed under **Elastic License 2.0**

* You may not provide the software to third parties as a hosted or managed
service, where the service provides users with access to any substantial set of
the features or functionality of the software.

* You may not move, change, disable, or circumvent the license key functionality
in the software, and you may not remove or obscure any functionality in the
software that is protected by the license key.

* You may not alter, remove, or obscure any licensing, copyright, or other notices
of the licensor in the software. Any use of the licensor’s trademarks is subject
to applicable law.

Thank you for your compliance, we work hard on the development of KeyAuth and do not appreciate our copyright being infringed.