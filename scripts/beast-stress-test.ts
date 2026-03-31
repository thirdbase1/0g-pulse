import { MozoSubz, type BulkOrder } from '../packages/mozosubz/src/index.ts';

const API_KEY = process.env.API_KEY || 'TEST_KEY';
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3001/api';
const CONCURRENCY = Number(process.env.CONCURRENCY) || 20;
const TOTAL_ORDERS = Number(process.env.TOTAL_ORDERS) || 200;

async function runStressTest() {
  console.log('🦁 MOZOSUBZ BEAST STRESS TEST 🦁');
  console.log('-----------------------------------');
  console.log(`Target URL: ${TARGET_URL}`);
  console.log(`Concurrency: ${CONCURRENCY} lanes`);
  console.log(`Total Orders: ${TOTAL_ORDERS}`);
  console.log('-----------------------------------');

  const mozo = new MozoSubz({
    apiKey: API_KEY,
    baseUrl: TARGET_URL,
    concurrency: CONCURRENCY,
    debug: false // Keep it clean for the stress test
  });

  const orders: BulkOrder[] = Array.from({ length: TOTAL_ORDERS }, (_, i) => ({
    phone: `0814055${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    serviceID: 'mtn_sme',
    plan: '179'
  }));

  console.log(`🚀 Launching ${TOTAL_ORDERS} orders across ${CONCURRENCY} parallel lanes...`);

  const startTime = Date.now();
  const results = await mozo.bulkBuy(orders);
  const endTime = Date.now();

  const totalTime = (endTime - startTime) / 1000;
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  const rps = (TOTAL_ORDERS / totalTime).toFixed(2);

  console.log('-----------------------------------');
  console.log('📊 STRESS TEST RESULTS');
  console.log(`Total Time: ${totalTime.toFixed(2)} seconds`);
  console.log(`Throughput: ${rps} requests/second`);
  console.log(`Success: ✅ ${successful}`);
  console.log(`Failed:  ❌ ${failed}`);
  console.log('-----------------------------------');

  if (failed > 0) {
    console.log('Error Sample:');
    console.log(results.find(r => !r.success)?.error);
  }
}

runStressTest().catch(console.error);
