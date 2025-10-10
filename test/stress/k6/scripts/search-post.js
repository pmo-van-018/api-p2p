import { check } from 'k6';
import { ApiRequest } from '../utils/api-request.js';

const configData = JSON.parse(open(`../data/config.json`));

const apiRequest = new ApiRequest(configData['API_URL']);

export const options = {
  // stages: [
  //   { duration: '10s', target: 100 },
  //   { duration: '10s', target: 200 },
  //   { duration: '30s', target: 500 },
  //   { duration: '10s', target: __ENV.SEARCH_POST_TARGET || 1000 },
  //   { duration: '1m30s', target: __ENV.SEARCH_POST_TARGET || 1000 },
  //   { duration: '30s', target: 0 },
  // ],
  stages: [
    { duration: '10s', target: 20 },
    { duration: '10s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '10s', target: __ENV.SEARCH_POST_TARGET || 500 },
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

export default function () {
  const result = apiRequest.post(
    `/api/user/search-posts`,
    getSellPostPayload(),
  );
  check(result.data, {
    'Success search buy post': (r) => {
      return Object.keys(r['data']).length;
    },
  });
}

function getSellPostPayload() {
  return {
    assetName: 'USDT',
    assetNetwork: 'Polygon',
    fiat: 'VND',
    page: 1,
    rows: 100,
    amount: '',
    type: 'BUY',
  };
}
