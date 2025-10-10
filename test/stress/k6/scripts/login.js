import { check } from 'k6';
import { ApiRequest } from '../utils/api-request.js';

const configData = JSON.parse(open(`../data/config.json`));

const usersNotLogin = JSON.parse(
  open(`../data/end-users-${__ENV.USER_COUNT}.json`),
);

const apiRequest = new ApiRequest(configData['API_URL']);

export const options = {
  stages: [
    { duration: '5s', target: 100 },
    { duration: '10s', target: __ENV.LOGIN_TARGET || 1000 },
    { duration: '10s', target: __ENV.LOGIN_TARGET || 1000 },
    { duration: '1s', target: 0 },
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
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

export default function () {
  const position = Math.floor(Math.random() * usersNotLogin.length);
  const credential = usersNotLogin[position];

  usersNotLogin.splice(position, 1);

  apiRequest.setCookie(credential['cookie']);

  const result = apiRequest.post(
    '/api/auth/login',
    {
      message: credential['message'],
      signature: credential['signature'],
      loginType: credential['loginType'],
    },
    credential['cookie'],
  );
  check(result.data, {
    'Success login': (r) => {
      return r['success'] === true;
    },
  });
}
