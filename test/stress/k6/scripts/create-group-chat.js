import { check } from 'k6';
import { ApiRequest } from '../utils/api-request.js';

const apiRequest = new ApiRequest(__ENV.CHAT_API_URL);

export const options = {
  // stages: [
  //   { duration: '10s', target: 100 },
  //   { duration: '10s', target: 200 },
  //   { duration: '30s', target: 500 },
  //   { duration: '1m', target: 500 },
  //   { duration: '10s', target: __ENV.CREATE_GROUP_CHAT_TARGET || 500 },
  //   { duration: '30s', target: 0 },
  // ],
  stages: [
    { duration: '10s', target: 20 },
    { duration: '10s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '10s', target: __ENV.CREATE_GROUP_CHAT_TARGET || 500 },
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
  },
};

export function setup() {
  const peerId = createPeerId();
  return { peerId };
}

export default function ({ peerId }) {
  const result = apiRequest.postToChat(
    '/api/bot/rooms/create',
    {
      name: 'p2pd-k6-' + new Date().getTime(),
      userIds: [peerId],
    },
    getChatApiHeader(),
  );
  check(result, {
    'Success create appeal room': (r) => {
      return r.statusCode === 201;
    },
  });
}

function createPeerId() {
  const result = apiRequest.postToChat(
    '/api/bot/users/create',
    {
      type: 'USER',
    },
    getChatApiHeader(),
  );
  return result.data._id;
}

function getChatApiHeader() {
  const headers = {
    [__ENV.CHAT_PREFIX_HEADER]: `${__ENV.CHAT_API_KEY}:${__ENV.CHAT_API_KEY_HASH}`,
    'Content-Type': 'application/json',
  };
  return headers;
}
