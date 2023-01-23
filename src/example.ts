import Logger from './keyauth_logger/logger';
const log = new Logger({
  silent: false,
  WebhookSilent: false,
  application: 'testing',
  fileRotationSilent: false,
  console: {
    level: 'debug',
    silent: false,
  },
  file: {
    level: 'debug',
    silent: true,
  },
  webhook: {
    id: '1064262436028424333',
    token:
      'kdP5brCHspa3rgcwLiyb-Fu5Wc2Ehw8_-Dm1CwnQCxqYmOz2vTYBydHdOCOHtQPePY6t',
    level: 'debug',
    silent: true,
  },
});
import keyauthApi from './keyauth_api/keyauthApi';
const api = new keyauthApi(
  {
    name: 'keyauthTest',
    ownerId: 'EdmsTKiuld',
    secret: '849f78286ef451079f7d91d8b565527d209eb4db569cc9c0f3629a1e2b0e2e5a',
    version: '1.0',
  },
  { apiVer: '1.2', logs: true, useEncKey: true },
);
export default async function main() {
  const init = await api.initialize();
  if (!init.success) {
    log.error(init.message, 'InitError');
    process.exit();
  }
  const license = await api.license(
    '1VNRQW-6LP6BR-IB8R3W-TSSQ4V-TMG9VY-HXF5CS',
  );
  if (!license.success) {
    log.error(`Failed to license reason: ${license.message}`);
  } else {
    log.debug(license.message);
  }
}
main();
