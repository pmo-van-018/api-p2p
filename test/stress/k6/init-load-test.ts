import { ethers } from 'ethers';
import fs from 'fs';
import got from 'got';
import { SiweMessage } from 'siwe';

import { Config } from './config';

export const AppConfig = Config.getInstance().init();

const apiUrl = new URL(AppConfig.data.API_URL);

const client = got.extend({
  prefixUrl: AppConfig.data.API_URL,
  timeout: 30000,
});

const ethersProvider = new ethers.providers.JsonRpcProvider({
  url: AppConfig.data.BLOCKCHAIN_VCHAIN_RPC_URL,
});

const scriptsNeedUseEndUser = ['create-order.js'];

if (require.main === module) {
  const count = AppConfig.data.MAX_USER_CREDENTIAL;

  getResource().then(
    async () => {
      await generateMerchantsJson();
      if (
        scriptsNeedUseEndUser.find((script) =>
          AppConfig.data['SCRIPTS'].includes(script),
        )
      ) {
        await generateUsersWithoutLogin(count);
        await generateUsersWithLogin(count);
      }
      process.exit(0);
    },
    (err) => {
      console.log(err);
      process.exit(1);
    }
  );
}

async function getResource() {
  const result = await client.get('api/master-data/resource');
  const data = JSON.parse(result.body)['data'];
  const jsonFile = AppConfig.getResourceJsonFilePath();
  fs.writeFileSync(jsonFile, JSON.stringify(data), { flag: 'w' });
}

async function generateUsersWithoutLogin(userCount = 1000): Promise<void> {
  const results = await bulkRequest(() => getUserData(), {
    total: userCount,
    chunk: 100,
  });

  const jsonFile = AppConfig.getEndUserWithoutLoginJsonFilePath();

  fs.writeFileSync(jsonFile, JSON.stringify(results), { flag: 'w' });
}

async function generateUsersWithLogin(userCount = 1000): Promise<void> {
  const results = await bulkRequest(() => getUserDataWithLogin(), {
    total: userCount,
    chunk: 100,
  });

  const jsonFile = AppConfig.getEndUserWithLoginJsonFilePath();
  fs.writeFileSync(jsonFile, JSON.stringify(results), { flag: 'w' });
}

async function generateMerchantsJson(): Promise<void> {
  const accounts = [
    {
      address: '0x019E935d55bF5291Fb2d1196B79d57AFb14AA7FB', // martin manager
      privateKey:
        '0x18a2748f51653db34dc0b2dad8b7da1838c4f26715861e57a0cd43f8e6d89550',
      mnemonic: {
        phrase:
          'crew domain essence draft acoustic slight fade cactus rebel goat dream ask',
        path: "m/44'/60'/0'/0/0",
        locale: 'en',
      },
      type: 'merchant-manager',
    },
    {
      address: '0x2472EA96B554B5c48ab20595E47cCAE56f3865C6', // martin merchant operator
      privateKey:
        '0x190591a1959022da7833d15153538474c68881ecb57104a2e24b4cbc62ed1375',
      mnemonic: {
        phrase:
          'sting ability practice bread kind dignity across busy language eager comfort fun',
        path: "m/44'/60'/0'/0/0",
        locale: 'en',
      },
      type: 'merchant-operator',
    },
  ];

  const results: any[] = [];

  await Promise.all(
    accounts.map(async (account) => {
      const challenge = await getChallenge('/merchant');
      const nonce = JSON.parse(challenge.body)['nonce'];

      const message = getMessageSign(account.address, nonce);
      const signer = new ethers.Wallet(account.privateKey, ethersProvider);
      const sign = await signer.signMessage(message);
      results.push({
        message,
        signature: sign,
        loginType: 'Ethereum',
        account: {
          ...account,
        },
        cookie: challenge.headers['set-cookie'],
      });
    })
  );
  const jsonFile = AppConfig.getMerchantJsonFilePath();
  fs.writeFileSync(jsonFile, JSON.stringify(results), { flag: 'w' });
}

async function getUserData(): Promise<{
  message: string;
  signature: string;
  loginType: string;
  account: any;
  cookie: any;
}> {
  const challenge = await getChallenge();
  const nonce = JSON.parse(challenge.body)['nonce'];

  const account = getAccount();

  const message = getMessageSign(account.address, nonce);
  const signer = new ethers.Wallet(account.privateKey, ethersProvider);

  const sign = await signer.signMessage(message);
  return {
    message,
    signature: sign,
    loginType: 'Ethereum',
    account: {
      ...account,
      privateKey: account.privateKey,
      mnemonic: account.mnemonic,
    },
    cookie: challenge.headers['set-cookie'],
  };
}

async function getUserDataWithLogin(): Promise<{
  message: string;
  signature: string;
  loginType: string;
  account: any;
  cookie: any;
}> {
  const { message, signature, cookie, ...restData } = await getUserData();

  const loginUser = await client.post('api/auth/login', {
    body: JSON.stringify({
      message,
      signature,
      loginType: 'Ethereum',
    }),
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      cookie,
      'x-forwarded-proto': apiUrl.protocol,
      'x-forwarded-host': apiUrl.host,
    },
  });
  return {
    ...restData,
    message,
    signature,
    cookie: loginUser.headers?.['set-cookie']?.join(';'),
  };
}

function getAccount(): ethers.Wallet {
  return ethers.Wallet.createRandom().connect(ethersProvider);
}

async function getChallenge(prefixSite = '') {
  return await client.post(`api/auth${prefixSite}/login/challenge`);
}

function getMessageSign(address: string, nonce: string): string {
  const message = new SiweMessage({
    domain: apiUrl.host,
    address,
    statement: 'Sign in with Ethereum to the app.',
    uri: apiUrl.origin,
    version: '1',
    chainId: 1,
    nonce,
  });
  const msg = message.prepareMessage();
  return msg.replace(
    'wants you to sign in with your Ethereum account',
    'wants you to sign in with your account'
  );
}

async function bulkRequest(
  fn: any,
  options: { total: number; chunk: number } = { total: 500, chunk: 100 }
) {
  const { total, chunk } = options;

  const results: any[] = [];
  const totalRound = Math.floor(total / chunk) + (total % chunk ? 1 : 0);
  let round = 0;
  do {
    let count = 0;
    let data: any[] = [];
    do {
      const user = fn();
      data.push(user);
      count++;
    } while (count < chunk);
    data = await Promise.all(data);
    results.push(...data);
    round++;
    await timer(1 * 1000);
  } while (round < totalRound);
  return results;
}

async function timer(ms: number) {
  new Promise((res) => setTimeout(res, ms));
}
