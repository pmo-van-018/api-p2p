import { check } from 'k6';
import http from 'k6/http';
import { ApiRequest } from '../utils/api-request.js';

const configData = JSON.parse(open(`../data/config.json`));

const endUsers = JSON.parse(
  open(`../data/end-users-with-login-${__ENV.USER_COUNT}.json`),
);

const baseAPI = configData['API_URL'];
const apiRequest = new ApiRequest(baseAPI);

export const options = {
  // stages: [
  //   { duration: '10s', target: 100 },
  //   { duration: '10s', target: 200 },
  //   { duration: '30s', target: 500 },
  //   { duration: '1m', target: 500 },
  //   { duration: '10s', target: __ENV.CREATE_ORDER_TARGET || 1000 },
  //   { duration: '30s', target: 0 },
  // ],
  stages: [
    { duration: '10s', target: 20 },
    { duration: '10s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '10s', target: __ENV.CREATE_ORDER_TARGET || 500 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    checks: [
      {
        threshold: 'rate>=0.9',
        abortOnFail: false,
      },
    ],
    http_req_failed: [
      {
        threshold: 'rate<=0.1', // http errors should be less than 10%
        abortOnFail: false,
      },
    ],
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

export function setup() {
  const result = apiRequest.get(
    `/api/marketplace/get-posts?assetName=USDT&assetNetwork=Polygon&fiat=VND&type=SELL&page=1&limit=100`,
    endUsers[0]['cookie'],
  );
  const { data } = result['data'];
  return { posts: data.items };
}

export default function ({ posts }) {
  const positionPost = Math.floor(Math.random() * posts.length);
  const positionEndUser = Math.floor(Math.random() * endUsers.length);

  const post = posts[positionPost];
  const endUser = endUsers[positionEndUser];

  apiRequest.setCookie(endUser['cookie']);

  const res = http.post(
    `${baseAPI}/api/user/create-buy-order`,
    JSON.stringify({
      totalPrice: post['minOrderAmount'],
      postId: post['id'],
      price: post['price'],
    }),
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        cookie: endUser['cookie'],
      },
    },
  );
  check(res, {
    'Did not error or user has a pending buy order': (r) => {
      const result = res.json();
      console.log(
        'did not error or user has a pending buy order: ',
        result['errors'],
      );
      return (
        r.status === 200 ||
        result['errors'][0]['key'] === 'USER_HAS_A_PENDING_BUY_ORDER'
      );
    },
  });
  const result = res.json();
  const orderId = result['data']['orderId'];
  if (orderId) {
    apiRequest.put(
      '/api/user/cancel-buy-order',
      {
        orderId,
      },
      endUser['cookie'],
      'Did not error and success cancel order!',
    );
  }
}
