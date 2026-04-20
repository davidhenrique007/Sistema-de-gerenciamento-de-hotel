import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:5000';

export default function() {
  const response = http.get(`${BASE_URL}/api/health`);
  check(response, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}

export const options = {
  vus: 10,
  duration: '30s',
};