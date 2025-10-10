import { check } from 'k6';
import { ApiRequest } from '../utils/api-request.js';

const configData = JSON.parse(open(`../data/config.json`));

const apiRequest = new ApiRequest(configData['API_URL']);

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '10s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '10s', target: __ENV.LIST_ONLINE_POST_TARGET || 500 },
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
    http_req_duration: ['p(95)<800'], // 95% of requests should be below 500ms
  },
};

export function setup() {
  const searchPostResult = apiRequest.get(`/api/marketplace/get-posts-brief?assetName=USDT&assetNetwork=Polygon&fiat=VND&page=1&limit=10&type=SELL`);
  const postIds = searchPostResult.data.data.items.map((post) => post.id);
  return { postIds };
}

export default function (data) {
  const result = apiRequest.post(
    `/api/marketplace/list-online-posts`,
    randomOnlinePostIds(data.postIds),
  );
  check(result.data, {
    'Success list online post': (r) => {
      return Object.keys(r['data']).length;
    },
  });
}

function randomOnlinePostIds(postIds) {
  const randomLength = Math.floor(Math.random() * postIds.length);
  const randomPostIds = [];

  while (randomPostIds.length < randomLength) {
    const randomPostId = postIds[Math.floor(Math.random() * postIds.length)];
    randomPostIds.push(randomPostId);
  }

  return randomPostIds;
}
