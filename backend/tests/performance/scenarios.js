import http from 'k6/http';
import { check, sleep } from 'k6';

const config = JSON.parse(open('./config.json'));
const BASE_URL = config.environments.local.baseUrl;

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Teste de listagem de quartos
export function quartosTest() {
  const response = http.get(`${BASE_URL}/api/quartos/disponiveis`, { headers });
  
  check(response, {
    'quartos status 200': (r) => r.status === 200,
    'quartos response time < 200ms': (r) => r.timings.duration < 200
  });
  
  sleep(1);
}

// Teste de health check
export function healthTest() {
  const response = http.get(`${BASE_URL}/api/health`, { headers });
  
  check(response, {
    'health status 200': (r) => r.status === 200,
    'health has status ok': (r) => JSON.parse(r.body).status === 'ok'
  });
  
  sleep(0.5);
}

// Teste de login
export function loginTest() {
  const payload = JSON.stringify({
    email: 'admin@hotelparadise.com',
    password: 'admin123'
  });
  
  const response = http.post(`${BASE_URL}/api/auth/login`, payload, { headers });
  
  check(response, {
    'login status 200': (r) => r.status === 200,
    'login has token': (r) => JSON.parse(r.body).token !== undefined
  });
  
  sleep(2);
}

// Cenário misto
export default function() {
  const random = Math.random();
  
  if (random < 0.5) {
    healthTest();
  } else if (random < 0.8) {
    quartosTest();
  } else {
    loginTest();
  }
}

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01']
  }
};
