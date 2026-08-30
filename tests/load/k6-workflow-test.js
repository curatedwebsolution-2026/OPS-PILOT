import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 virtual users
    { duration: '30s', target: 50 }, // Stay at 50 virtual users
    { duration: '10s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8000';

export default function () {
  // 1. Health Check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  // 2. Login as Demo User
  const loginPayload = JSON.stringify({
    email: 'admin@demo-ops.com',
    password: 'DemoPassword123!',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, params);
  const loginSuccess = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });

  if (loginSuccess) {
    const token = loginRes.json('access_token');
    const authParams = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    // 3. Fetch Dashboard Stats
    const statsRes = http.get(`${BASE_URL}/api/v1/dashboard/stats`, authParams);
    check(statsRes, {
      'stats status is 200': (r) => r.status === 200,
    });
  }

  sleep(1);
}
