#!/usr/bin/env node

/**
 * 🦁 MOZOSUBZ STRESS CLI 🦁
 * A high-concurrency standalone airtime stress-tester for GSUBZ.com.
 * No dependencies. Just Node.js.
 *
 * @author Jules
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// --- CONFIGURATION ---
const API_KEY = process.env.API_KEY || '';
const PHONE = process.env.PHONE || '';
const CONCURRENCY = Number(process.env.CONCURRENCY) || 20;
const TOTAL_REQUESTS = Number(process.env.TOTAL_REQUESTS) || 200;
const SERVICE = process.env.SERVICE || 'mtn';
const BASE_URL = process.env.BASE_URL || 'https://gsubz.com/api';

const COLORS = {
  reset: '\x1b[0m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

async function runMozoSubzStressCli() {
  console.log(`${COLORS.magenta}🦁 MOZOSUBZ STRESS CLI 🦁${COLORS.reset}`);
  console.log(`${COLORS.cyan}-----------------------------------${COLORS.reset}`);
  console.log(`Target: ${BASE_URL} (Airtime Only)`);
  console.log(`Phone:  ${PHONE || 'MISSING'}`);
  console.log(`Config: ${CONCURRENCY} lanes, ${TOTAL_REQUESTS} total requests`);
  console.log(`${COLORS.cyan}-----------------------------------${COLORS.reset}`);

  if (!API_KEY || !PHONE) {
    console.error(`${COLORS.red}❌ ERROR: API_KEY and PHONE environment variables are required.${COLORS.reset}`);
    process.exit(1);
  }

  const orders = Array.from({ length: TOTAL_REQUESTS }, (_, i) => ({
    id: i + 1,
    phone: PHONE,
    serviceID: SERVICE,
    amount: (100 + (i % 10) * 100).toString()
  }));

  // Confirm API Key and Balance first
  try {
    const balanceUrl = new URL(`${BASE_URL}/balance/`);
    const balanceData = `api=${API_KEY}`;
    const balanceOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'api': `Bearer ${API_KEY}`
      }
    };

    await new Promise((resolve) => {
      const protocol = balanceUrl.protocol === 'https:' ? https : http;
      const req = protocol.request(balanceUrl, balanceOptions, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          console.log(`${COLORS.green}✅ API Connection Verified.${COLORS.reset}`);
          console.log(`Current Balance: ${body}`);
          resolve();
        });
      });
      req.on('error', (e) => {
        console.log(`${COLORS.red}⚠️ Warning: Could not verify balance: ${e.message}${COLORS.reset}`);
        resolve();
      });
      req.write(balanceData);
      req.end();
    });
  } catch (e) {}

  console.log(`🚀 BRUTE-FORCING ${TOTAL_REQUESTS} CONCURRENT REQUESTS...`);
  console.log(`\n${COLORS.yellow}LIVE TICKER:${COLORS.reset}`);
  console.log('ID | STATUS | LATENCY | AMOUNT | ERROR');
  console.log('---|--------|---------|--------|-------');

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  const errorTypes = {};

  const activeRequests = [];
  const queue = [...orders];

  const performRequest = (order) => {
    return new Promise((resolve) => {
      const reqStart = Date.now();
      const apiUrl = new URL(`${BASE_URL}/pay/`);
      const postData = `serviceID=${order.serviceID}&api=${API_KEY}&amount=${order.amount}&phone=${order.phone}&requestID=STRESS-${Date.now()}-${order.id}`;

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'api': `Bearer ${API_KEY}`
        }
      };

      const protocol = apiUrl.protocol === 'https:' ? https : http;
      const req = protocol.request(apiUrl, options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          if (res.statusCode !== 200) {
            const latency = Date.now() - reqStart;
            failCount++;
            const errorMsg = `HTTP_${res.statusCode}`;
            errorTypes[errorMsg] = (errorTypes[errorMsg] || 0) + 1;
            console.log(`${COLORS.red}#${order.id.toString().padStart(3, '0')} | FAIL   | ${latency}ms | ₦${order.amount} | ${errorMsg}${COLORS.reset}`);
            return resolve();
          }
          const latency = Date.now() - reqStart;
          let result;
          try {
            result = JSON.parse(responseBody);
          } catch (e) {
            result = { status: 'ERROR', error: 'INVALID_JSON' };
          }

          if (result.status === 'TRANSACTION_SUCCESSFUL') {
            successCount++;
            console.log(`${COLORS.green}#${order.id.toString().padStart(3, '0')} | OK     | ${latency}ms | ₦${order.amount}${COLORS.reset}`);
          } else {
            failCount++;
            const errorMsg = result.error || result.status || 'FAILED';
            errorTypes[errorMsg] = (errorTypes[errorMsg] || 0) + 1;
            console.log(`${COLORS.red}#${order.id.toString().padStart(3, '0')} | FAIL   | ${latency}ms | ₦${order.amount} | ${errorMsg}${COLORS.reset}`);
          }
          resolve();
        });
      });

      req.on('error', (err) => {
        const latency = Date.now() - reqStart;
        failCount++;
        const errorMsg = err.code || err.message || 'SOCKET_ERROR';
        errorTypes[errorMsg] = (errorTypes[errorMsg] || 0) + 1;
        console.log(`${COLORS.red}#${order.id.toString().padStart(3, '0')} | ERROR  | ${latency}ms | ₦${order.amount} | ${errorMsg}${COLORS.reset}`);
        resolve();
      });

      req.write(postData);
      req.end();
    });
  };

  while (queue.length > 0 || activeRequests.length > 0) {
    while (queue.length > 0 && activeRequests.length < CONCURRENCY) {
      const order = queue.shift();
      const promise = performRequest(order).then(() => {
        activeRequests.splice(activeRequests.indexOf(promise), 1);
      });
      activeRequests.push(promise);
    }
    if (activeRequests.length > 0) await Promise.race(activeRequests);
  }

  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  const rps = (TOTAL_REQUESTS / totalTime).toFixed(2);

  console.log(`\n${COLORS.cyan}-----------------------------------${COLORS.reset}`);
  console.log(`${COLORS.magenta}📊 STRESS REPORT${COLORS.reset}`);
  console.log(`Total Time:  ${totalTime.toFixed(2)} seconds`);
  console.log(`Throughput:  ${rps} requests/second`);
  console.log(`Success:     ${COLORS.green}${successCount}${COLORS.reset}`);
  console.log(`Failed:      ${COLORS.red}${failCount}${COLORS.reset}`);
  console.log(`${COLORS.cyan}-----------------------------------${COLORS.reset}`);

  if (Object.keys(errorTypes).length > 0) {
    console.log(`${COLORS.yellow}Top Error Types:${COLORS.reset}`);
    for (const [msg, count] of Object.entries(errorTypes)) {
      console.log(`- ${msg}: ${count}`);
    }
  }
}

runMozoSubzStressCli().catch(console.error);
