import { MozoSubz, type BulkOrder } from '../packages/mozosubz/src/index.ts';

const API_KEY = process.env.API_KEY || '';
const PHONE = process.env.PHONE || '';
const CONCURRENCY = Number(process.env.CONCURRENCY) || 20;
const TOTAL_REQUESTS = Number(process.env.TOTAL_REQUESTS) || 200;
const SERVICE = process.env.SERVICE || 'mtn';

async function runBeastTerminal() {
  console.log('\x1b[35m%s\x1b[0m', '🦁 MOZOSUBZ BEAST TERMINAL CLI 🦁');
  console.log('\x1b[36m%s\x1b[0m', '-----------------------------------');
  console.log(`Target: REAL GSUBZ API (Airtime Only)`);
  console.log(`Phone:  ${PHONE || 'MISSING'}`);
  console.log(`Config: ${CONCURRENCY} lanes, ${TOTAL_REQUESTS} total requests`);
  console.log('\x1b[36m%s\x1b[0m', '-----------------------------------');

  if (!API_KEY || !PHONE) {
    console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: API_KEY and PHONE environment variables are required.');
    process.exit(1);
  }

  const mozo = new MozoSubz({
    apiKey: API_KEY,
    concurrency: CONCURRENCY,
    debug: false // Using custom live tracker
  });

  const orders: BulkOrder[] = Array.from({ length: TOTAL_REQUESTS }, (_, i) => ({
    phone: PHONE,
    serviceID: SERVICE as any,
    amount: (100 + (i % 10) * 100).toString() // Varying amounts for test variety
  }));

  console.log(`🚀 BRUTE-FORCING ${TOTAL_REQUESTS} CONCURRENT REQUESTS...`);
  console.log('\n\x1b[33m%s\x1b[0m', 'LIVE TICKER:');
  console.log('ID | STATUS | LATENCY | AMOUNT | ERROR');
  console.log('---|--------|---------|--------|-------');

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  const errors: Record<string, number> = {};

  // Custom bulk processor for live tracking
  const activeRequests: Promise<void>[] = [];
  const queue = [...orders];

  const sendRequest = async (order: BulkOrder, id: number) => {
    const reqStart = Date.now();
    try {
      const res = await mozo.buyAirtime(order.phone, Number(order.amount), order.serviceID);
      const latency = Date.now() - reqStart;

      if (res.status === 'TRANSACTION_SUCCESSFUL') {
        successCount++;
        console.log(`\x1b[32m#${id.toString().padStart(3, '0')} | OK     | ${latency}ms | ₦${order.amount}\x1b[0m`);
      } else {
        failCount++;
        const errorMsg = res.error || 'FAILED';
        errors[errorMsg] = (errors[errorMsg] || 0) + 1;
        console.log(`\x1b[31m#${id.toString().padStart(3, '0')} | FAIL   | ${latency}ms | ₦${order.amount} | ${errorMsg}\x1b[0m`);
      }
    } catch (err: any) {
      failCount++;
      const latency = Date.now() - reqStart;
      errors[err.message] = (errors[err.message] || 0) + 1;
      console.log(`\x1b[31m#${id.toString().padStart(3, '0')} | ERROR  | ${latency}ms | ₦${order.amount} | ${err.message}\x1b[0m`);
    }
  };

  let idCounter = 1;
  while (queue.length > 0 || activeRequests.length > 0) {
    while (queue.length > 0 && activeRequests.length < CONCURRENCY) {
      const order = queue.shift()!;
      const promise = sendRequest(order, idCounter++).then(() => {
        activeRequests.splice(activeRequests.indexOf(promise), 1);
      });
      activeRequests.push(promise);
    }
    if (activeRequests.length > 0) await Promise.race(activeRequests);
  }

  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  const rps = (TOTAL_REQUESTS / totalTime).toFixed(2);

  console.log('\n\x1b[36m%s\x1b[0m', '-----------------------------------');
  console.log('\x1b[35m%s\x1b[0m', '📊 BEAST TERMINAL REPORT');
  console.log(`Total Time:  ${totalTime.toFixed(2)} seconds`);
  console.log(`Throughput:  ${rps} requests/second`);
  console.log(`Success:     \x1b[32m${successCount}\x1b[0m`);
  console.log(`Failed:      \x1b[31m${failCount}\x1b[0m`);
  console.log('\x1b[36m%s\x1b[0m', '-----------------------------------');

  if (Object.keys(errors).length > 0) {
    console.log('\x1b[33m%s\x1b[0m', 'Top Error Types:');
    for (const [msg, count] of Object.entries(errors)) {
      console.log(`- ${msg}: ${count}`);
    }
  }
}

runBeastTerminal().catch(console.error);
