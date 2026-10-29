/**
 * Automated API Test Suite for Portfolio Backend & Direct Email Integration
 * Tests all required scenarios:
 * 1. Health endpoint (200 OK with DB & email service status)
 * 2. Empty form validation rejection (400 Bad Request)
 * 3. Invalid email validation rejection (400 Bad Request)
 * 4. Missing message validation rejection (400 Bad Request)
 * 5. Safe handling when email credentials need configuration (500 with clean error, no crash/leaks)
 * 6. Admin endpoint rejects unauthenticated requests (401 Unauthorized)
 * 7. Admin endpoint rejects invalid keys (403 Forbidden)
 * 8. Admin endpoint accepts valid ADMIN_API_KEY (200 OK)
 * 9. Static portfolio frontend is served on GET / (200 OK)
 * 10. Undefined endpoint returns structured 404
 */

const http = require('http');

const API_BASE = 'http://localhost:5000';
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'ManasaPortfolioAdminSecret2026!';

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (body) {
      reqOptions.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   PORTFOLIO BACKEND & EMAIL API TEST SUITE         ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Reason:`, err.message);
    }
  }

  // 1. Health Endpoint
  await test('Scenario 1: GET /api/health returns 200 with service and email status', async () => {
    const res = await request('/api/health');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.status !== 'healthy') throw new Error(`Expected status: healthy, got ${res.body.status}`);
    if (!res.body.emailService) throw new Error('Missing emailService info in health response');
    if (res.body.emailService.recipient !== 'reddymanasa0271@gmail.com') {
      throw new Error(`Expected recipient reddymanasa0271@gmail.com, got ${res.body.emailService.recipient}`);
    }
  });

  // 2. Empty Form Submission
  await test('Scenario 2: POST /api/contact with empty body returns 400 Bad Request', async () => {
    const res = await request('/api/contact', { method: 'POST' }, {});
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (res.body.success !== false) throw new Error('Expected success: false');
    if (!res.body.errors || res.body.errors.length === 0) throw new Error('Expected validation error list');
  });

  // 3. Invalid Email Format
  await test('Scenario 3: POST /api/contact with invalid email returns 400 Bad Request', async () => {
    const res = await request('/api/contact', { method: 'POST' }, {
      name: 'Test Visitor',
      email: 'not-a-valid-email',
      message: 'This message has an invalid email format.'
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const emailErr = res.body.errors && res.body.errors.find(e => e.field === 'email');
    if (!emailErr) throw new Error('Expected email validation error in response');
  });

  // 4. Missing Message Field
  await test('Scenario 4: POST /api/contact with missing message returns 400 Bad Request', async () => {
    const res = await request('/api/contact', { method: 'POST' }, {
      name: 'John Doe',
      email: 'john@example.com',
      message: ''
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const msgErr = res.body.errors && res.body.errors.find(e => e.field === 'message');
    if (!msgErr) throw new Error('Expected message validation error in response');
  });

  // 5. Valid Structure Response Check
  await test('Scenario 5: POST /api/contact with valid data handles delivery safely without leaking credentials', async () => {
    const res = await request('/api/contact', { method: 'POST' }, {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      subject: 'Job Opportunity',
      message: 'Hello Manasa, I would love to connect regarding an engineer opening.'
    });

    // If placeholder credentials: returns 500 with friendly message (does not return false success)
    // If real credentials: returns 200 with success message
    if (res.status === 200) {
      if (!res.body.success) throw new Error('Expected success: true on 200');
    } else if (res.status === 500) {
      if (res.body.success !== false) throw new Error('Expected success: false on 500');
      if (res.body.message !== 'Unable to send your message. Please try again later.') {
        throw new Error(`Unexpected message on failure: ${res.body.message}`);
      }
    } else {
      throw new Error(`Unexpected status code: ${res.status}`);
    }
  });

  // 6. Unauthenticated Admin Endpoint
  await test('Scenario 6: GET /api/contact without authentication returns 401 Unauthorized', async () => {
    const res = await request('/api/contact', { method: 'GET' });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    if (res.body.success !== false) throw new Error('Expected success: false');
  });

  // 7. Invalid Admin Credentials
  await test('Scenario 7: GET /api/contact with invalid key returns 403 Forbidden', async () => {
    const res = await request('/api/contact', {
      method: 'GET',
      headers: { 'x-api-key': 'WrongInvalidSecret123' }
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 8. Authorized Admin Retrieval
  await test('Scenario 8: GET /api/contact with valid ADMIN_API_KEY returns 200 with messages', async () => {
    const res = await request('/api/contact', {
      method: 'GET',
      headers: { 'x-api-key': ADMIN_KEY }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.success) throw new Error('Expected success: true');
    if (!Array.isArray(res.body.data)) throw new Error('Expected data to be array of messages');
  });

  // 9. Static Frontend Serving
  await test('Scenario 9: GET / serves the portfolio HTML page', async () => {
    const res = await request('/');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (typeof res.body !== 'string' || !res.body.includes('Mukkamalla Manasa Reddy')) {
      throw new Error('Frontend HTML not returned on GET /');
    }
  });

  // 10. Undefined Endpoint 404 Handler
  await test('Scenario 10: GET /api/unknown-endpoint returns 404 Not Found', async () => {
    const res = await request('/api/unknown-endpoint');
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    if (res.body.success !== false) throw new Error('Expected success: false');
  });

  console.log('\n====================================================');
  console.log(`Test Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
