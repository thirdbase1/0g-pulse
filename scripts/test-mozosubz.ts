import { MozoSubz, type BulkOrder } from '../packages/mozosubz/src/index.ts';

async function runTest() {
  console.log('🚀 Starting MozoSubz BEAST SDK Test (Sandbox Mode)');
  console.log('--------------------------------------------------');

  const sdk = new MozoSubz({
    apiKey: 'SANDBOX_KEY',
    sandbox: true,
    debug: true,
    concurrency: 10,
    margin: { type: 'flat', value: 50 } // Add 50 Naira profit
  });

  try {
    // 1. Test Balance
    console.log('\n--- Testing Balance ---');
    const balance = await sdk.getBalance();
    console.log(`💰 Sandbox Balance: ₦${balance}`);

    // 2. Test Fetching Plans with Margin
    console.log('\n--- Testing Plans with Margin ---');
    const plans = await sdk.getPlans('mtn_sme');
    console.log(`Fetched ${plans.length} plans.`);
    console.log('Example Plan (Wholesale vs Retail):');
    console.log(`Name: ${plans[0].displayName}`);
    console.log(`Wholesale: ₦${plans[0].price}`);
    console.log(`Retail (Beast Margin): ₦${plans[0].retailPrice}`);

    // 3. Test Airtime Purchase
    console.log('\n--- Testing Airtime Purchase ---');
    const airtimeRes = await sdk.buyAirtime('08140558898', 100, 'mtn');
    console.log(`Status: ${airtimeRes.status}`);
    console.log(`Transaction ID: ${airtimeRes.content?.transactionID}`);

    // 4. Test Data Purchase with Price Audit
    console.log('\n--- Testing Data Purchase (Price Audit Pass) ---');
    const dataRes = await sdk.buyData('08140558898', 'mock-1', 'mtn_sme', { expectedPrice: 150 });
    console.log(`Status: ${dataRes.status}`);

    // 5. Test Price Audit Failure
    console.log('\n--- Testing Data Purchase (Price Audit Fail) ---');
    try {
      await sdk.buyData('08140558898', 'mock-1', 'mtn_sme', { expectedPrice: 50 });
    } catch (e: any) {
      console.log(`Caught expected error: ${e.message}`);
    }

    // 6. Test Error Handling (Sandbox special numbers)
    console.log('\n--- Testing Error Handling (Insufficient Balance) ---');
    const errorRes = await sdk.buyAirtime('0800-ERROR-402', 100, 'mtn');
    console.log(`Status: ${errorRes.status}, Error: ${errorRes.error}`);

    // 7. BEAST FEATURE: BULK BUYING (20 orders)
    console.log('\n--- BEAST MODE: Testing Bulk Buying (20 Orders) ---');
    const bulkOrders: BulkOrder[] = Array.from({ length: 20 }, (_, i) => ({
      phone: `081405588${i.toString().padStart(2, '0')}`,
      serviceID: 'mtn_sme',
      plan: 'mock-1'
    }));

    const startTime = Date.now();
    const results = await sdk.bulkBuy(bulkOrders);
    const endTime = Date.now();

    console.log(`--------------------------------------------------`);
    console.log(`Bulk Operation Summary:`);
    console.log(`Total Orders: ${results.length}`);
    console.log(`Successful: ${results.filter(r => r.success).length}`);
    console.log(`Total Time: ${(endTime - startTime) / 1000} seconds`);
    console.log(`--------------------------------------------------`);

  } catch (error) {
    console.error('Test Failed:', error);
  }
}

runTest();
