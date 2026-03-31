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
  console.log(`${COLORS.magenta}🦁 MOZOSUBZ STRESS CLI (SMART EDITION) 🦁${COLORS.reset}`);
  console.log(`${COLORS.cyan}-----------------------------------${COLORS.reset}`);
  console.log(`Target: ${BASE_URL} (Airtime Only)`);
  console.log(`Phone:  ${PHONE || 'MISSING'}`);
  console.log(`Config: Initial ${CONCURRENCY} lanes, ${TOTAL_REQUESTS} total requests`);
  console.log(`${COLORS.cyan}-----------------------------------${COLORS.reset}`);

  if (!API_KEY || !PHONE) {
    console.error(`${COLORS.red}❌ ERROR: API_KEY and PHONE environment variables are required.${COLORS.reset}`);
    process.exit(1);
  }

  // --- Step 1: Verify Balance ---
  try {
    const balanceUrl = new URL(`${BASE_URL}/balance/`);
    const balanceData = `api=${API_KEY}`;
    const balanceOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'api': `Bearer ${API_KEY}`,
        'Authorization': `Bearer ${API_KEY}` // Send both to be safe
      }
    };

    const balanceRes = await new Promise((resolve) => {
      const protocol = balanceUrl.protocol === 'https:' ? https : http;
      const req = protocol.request(balanceUrl, balanceOptions, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => resolve(body));
      });
      req.on('error', () => resolve(null));
      req.write(balanceData);
      req.end();
    });

    if (balanceRes) {
      try {
        const json = JSON.parse(balanceRes);
        if (json.balance !== undefined) {
          console.log(`${COLORS.green}✅ API Verified. Balance: ₦${json.balance}${COLORS.reset}`);
        } else {
          const errMsg = json.description || json.error || json.status || balanceRes;
          console.log(`${COLORS.red}❌ Balance Check Failed: ${errMsg}${COLORS.reset}`);
        }
      } catch (e) {
        console.log(`${COLORS.green}✅ API Verified. Raw Response: ${balanceRes}${COLORS.reset}`);
      }
    } else {
      console.log(`${COLORS.red}⚠️ Warning: No response from balance endpoint.${COLORS.reset}`);
    }
  } catch (e) {}

  const orders = Array.from({ length: TOTAL_REQUESTS }, (_, i) => ({
    id: i + 1,
    phone: PHONE,
    serviceID: SERVICE,
    amount: (100 + (i % 10) * 100).toString()
  }));

  console.log(`🚀 BRUTE-FORCING ${TOTAL_REQUESTS} REQUESTS (Adaptive Concurrency enabled)...`);
  console.log(`\n${COLORS.yellow}LIVE TICKER:${COLORS.reset}`);
  console.log('ID | STATUS | LATENCY | AMOUNT | ERROR');
  console.log('---|--------|---------|--------|-------');

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  const errorTypes = {};

  const activeRequests = [];
  const queue = [...orders];
  let currentLanes = CONCURRENCY;

  const performRequest = (order) => {
    return new Promise((resolve) => {
      let resolved = false;
      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      const reqStart = Date.now();
      const apiUrl = new URL(`${BASE_URL}/pay/`);
      const postData = `serviceID=${order.serviceID}&api=${API_KEY}&amount=${order.amount}&phone=${order.phone}&requestID=STRESS-${Date.now()}-${order.id}`;

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'api': `Bearer ${API_KEY}`,
          'Authorization': `Bearer ${API_KEY}`
        },
        timeout: 10000 // 10s timeout
      };

      const protocol = apiUrl.protocol === 'https:' ? https : http;
      const req = protocol.request(apiUrl, options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          if (resolved) return;
          const latency = Date.now() - reqStart;
          let result;
          try {
            result = JSON.parse(responseBody);
          } catch (e) {
            result = { status: 'ERROR', error: 'MALFORMED_JSON' };
          }

          if (res.statusCode !== 200 || (result.status && result.status !== 'TRANSACTION_SUCCESSFUL')) {
            failCount++;
            const errorMsg = result.description || result.error || result.api_response || result.status || `HTTP_${res.statusCode}`;
            errorTypes[errorMsg] = (errorTypes[errorMsg] || 0) + 1;
            console.log(`${COLORS.red}#${order.id.toString().padStart(3, '0')} | FAIL   | ${latency}ms | ₦${order.amount} | ${errorMsg}${COLORS.reset}`);

            // Smart: Decrease lanes on failure
            if (currentLanes > 5) currentLanes--;
          } else {
            successCount++;
            console.log(`${COLORS.green}#${order.id.toString().padStart(3, '0')} | OK     | ${latency}ms | ₦${order.amount}${COLORS.reset}`);

            // Smart: Increase lanes on success
            if (currentLanes < 500) currentLanes++;
          }
          safeResolve();
        });
      });

      req.on('timeout', () => {
        if (resolved) return;
        req.destroy();
        failCount++;
        errorTypes['TIMEOUT'] = (errorTypes['TIMEOUT'] || 0) + 1;
        console.log(`${COLORS.red}#${order.id.toString().padStart(3, '0')} | TIMEOUT| >10s | ₦${order.amount}${COLORS.reset}`);
        currentLanes = Math.max(5, Math.floor(currentLanes / 2)); // Aggressive scale down
        safeResolve();
      });

      req.on('error', (err) => {
        if (resolved) return;
        const latency = Date.now() - reqStart;
        failCount++;
        const errorMsg = err.code || 'SOCKET_ERROR';
        errorTypes[errorMsg] = (errorTypes[errorMsg] || 0) + 1;
        console.log(`${COLORS.red}#${order.id.toString().padStart(3, '0')} | ERROR  | ${latency}ms | ₦${order.amount} | ${errorMsg}${COLORS.reset}`);
        currentLanes = Math.max(5, Math.floor(currentLanes * 0.8));
        safeResolve();
      });

      req.write(postData);
      req.end();
    });
  };

  while (queue.length > 0 || activeRequests.length > 0) {
    while (queue.length > 0 && activeRequests.length < currentLanes) {
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
