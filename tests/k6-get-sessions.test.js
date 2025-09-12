import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';


const BASE_URL = __ENV.K6_API_URL || 'http://localhost:3000/api/game';

export let options = {

  scenarios: {
    // arbitrary name of scenario
    average_load: {
      executor: 'ramping-vus',
      stages: [
        // ramp up to average load of 20 virtual users
        { duration: '180s', target: 50 },
        // ramp down to zero
        { duration: '10m', target: 0 },
      ],
    },
  },
};

export default function () {

  // 1. Get Sessions
  let sessionsRes = http.get(BASE_URL);
  check(sessionsRes, { 'sessions listed': (r) => r.status === 200 });

  
}