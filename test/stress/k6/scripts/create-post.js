import { check } from 'k6';

import { ApiRequest } from '../utils/api-request.js';

const resourceData = JSON.parse(open(`../data/resource.json`));

const configData = JSON.parse(open(`../data/config.json`));

const merchantData = JSON.parse(open(`../data/merchants.json`));

const apiRequest = new ApiRequest(configData['API_URL']);

export const options = {
  // stages: [
  //   { duration: '10s', target: 100 },
  //   { duration: '10s', target: 200 },
  //   { duration: '30s', target: 500 },
  //   { duration: '1m', target: 500 },
  //   { duration: '10s', target: __ENV.CREATE_POST_TARGET || 1000 },
  //   { duration: '30s', target: 0 },
  // ],
  stages: [
    { duration: '10s', target: 20 },
    { duration: '10s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '10s', target: __ENV.CREATE_POST_TARGET || 500 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    checks: [
      {
        threshold: 'rate>=0.9',
        abortOnFail: true,
      },
    ],
    http_req_failed: [
      {
        threshold: 'rate<=0.1', // http errors should be less than 10%
        abortOnFail: true,
      },
    ],
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 500ms
  },
};

export function setup() {
  const merchantOperator = loginMerchantOperator();
  const merchantManager = loginMerchantManager();
  const paymentMethod = getOrCreatePaymentMethod(merchantManager.cookie);
  return { cookie: merchantOperator.cookie, paymentMethod };
}

export default function ({ cookie, paymentMethod }) {
  apiRequest.setCookie(cookie);
  const result = apiRequest.post(
    '/api/posts/merchant/create-post',
    getSellPostPayload(paymentMethod),
    cookie.replace(' Path=/, ', 'Path=/;'),
  );
  check(result.data, {
    'Success create sell post': (r) => {
      return Object.keys(r['data']).length;
    },
  });
}

const MIN_AVAILABLE_AMOUNT = 1000000;
const MAX_AVAILABLE_AMOUNT = 100000000;
const MIN_LOWER_FIAT = 50000;
const MAX_UPPER_FIAT = 100000;

function loginMerchantOperator() {
  const merchantOperator = merchantData.find(
    (credential) => credential['account']['type'] === 'merchant-operator',
  );
  apiRequest.setCookie(merchantOperator['cookie']);
  const result = apiRequest.post(
    '/api/auth/merchant/login',
    {
      message: merchantOperator['message'],
      signature: merchantOperator['signature'],
      loginType: merchantOperator['loginType'],
    },
    merchantOperator['cookie'],
  );
  return result;
}

function loginMerchantManager() {
  const merchantManager = merchantData.find(
    (credential) => credential['account']['type'] === 'merchant-manager',
  );
  apiRequest.setCookie(merchantManager['cookie']);
  const result = apiRequest.post(
    '/api/auth/merchant/login',
    {
      message: merchantManager['message'],
      signature: merchantManager['signature'],
      loginType: merchantManager['loginType'],
    },
    merchantManager['cookie'],
  );
  return result;
}

function getOrCreatePaymentMethod(cookie) {
  const result = apiRequest.get(
    '/api/payments/merchant/list-payment-methods?page=1&limit=100',
    cookie,
  );
  const { items } = result['data']['data'];
  if (!items.length) {
    const res = apiRequest.post('/api/payments/merchant/create-payment-method', {
      bankNumber: '9999999999',
      bankName: 'agribank',
      bankHolder: 'STRESSTEST',
    });
    return res['data']['data'];
  }
  return items[0];
}

const assetIds = resourceData['assets']
  .filter(({ network }) => network !== 'Tron')
  .map((asset) => asset['id']);
const fiatIds = resourceData['fiats'].map((fiat) => fiat['id']);

function getSellPostPayload(paymentMethod) {
  const availableAmount = randomNumber(
    MIN_AVAILABLE_AMOUNT,
    MAX_AVAILABLE_AMOUNT,
  );
  const lowerFiatLimit = randomNumber(MIN_LOWER_FIAT, MAX_UPPER_FIAT);
  const upperFiatLimit = randomNumber(MAX_UPPER_FIAT, availableAmount);
  return {
    type: Math.random() > 0.5 ? 'SELL' : 'BUY',
    assetId: assetIds[Math.round(randomNumber(0, assetIds.length - 1))],
    fiatId: fiatIds[Math.round(randomNumber(0, fiatIds.length - 1))],
    paymentMethodId: paymentMethod['paymentMethodId'],
    userToMerchantTime: 10,
    price: Math.random() * 2 + 1,
    availableAmount: availableAmount.toString(),
    lowerFiatLimit,
    upperFiatLimit,
    showAd: Math.round(randomNumber(0, 2)), // 0: Offline; 1: Online; 2: Close
    merchantNote: '',
  };
}

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
