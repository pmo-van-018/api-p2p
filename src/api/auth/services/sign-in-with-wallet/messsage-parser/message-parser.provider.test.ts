import { ethereumGrammarParser, tronGrammarParser } from './message-parser.provider';

const ETHEREUM_MESSAGE = `peter.van wants you to sign in with your account:
0x67Ad4a454e8bEbdCa071a4db67E1D04871c55478

Sign-in to the app.

URI: https://peter.van
Version: 1
Chain ID: 137
Nonce: otNrV6LmtBX7Ck9n
Issued At: 2023-10-24T06:59:31.544Z`;

const TRON_MESSAGE = `peter.van wants you to sign in with your account:
THnyewB8N41t2hf1KFNber8nd8CMd9Fb1m

Sign-in to the app.

URI: https://peter.van
Version: 1
Chain ID: 0x94a9059e
Nonce: 7ivzQ0hOC2Ymi4bn
Issued At: 2023-10-24T09:24:58.040Z`;

const ETHEREUM_WRONG_MESSAGE = `peter.van wants you to sign in with your Ethereum account:
0x67Ad4a454e8bEbdCa071a4db67E1D04871c55478

Sign-in to the app.

URI: https://peter.van
Version: 1
Chain ID: 137
Nonce: otNrV6LmtBX7Ck9n
Issued At: 2023-10-24T06:59:31.544Z`;

const TRON_WRONG_MESSAGE = `peter.van wants you to sign in with your Ethereum account:
THnyewB8N41t2hf1KFNber8nd8CMd9Fb1m

Sign-in to the app.

URI: https://peter.van
Version: 1
Chain ID: 0x94a9059e
Nonce: 7ivzQ0hOC2Ymi4bn
Issued At: 2023-10-24T09:24:58.040Z`;

test('when receive ETHEREUM_MESSAGE, then return parsed-message', async () => {
  const message = ethereumGrammarParser(ETHEREUM_MESSAGE);
  console.log(JSON.stringify(message, null, 2));
});

test('when receive ETHEREUM_WRONG_MESSAGE, then throw error', async () => {
  const test = () => ethereumGrammarParser(ETHEREUM_WRONG_MESSAGE);
  expect(test).toThrowError();
});

test('when receive TRON_MESSAGE, then return parsed-message', async () => {
  const message = tronGrammarParser(TRON_MESSAGE);
  console.log(JSON.stringify(message, null, 2));
});

test('when receive TRON_WRONG_MESSAGE, then throw error', async () => {
  const test = () => tronGrammarParser(TRON_WRONG_MESSAGE);
  expect(test).toThrowError();
});
