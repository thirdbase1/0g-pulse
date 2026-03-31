# MozoSubz SDK 🦁

**The "Beast" VTU Integration for GSUBZ.com**

MozoSubz is a high-performance, developer-first SDK for integrating Nigerian mobile data, airtime, and bill payments into your applications. It is built to handle ultra-speed bulk operations, automated security checks, and comes with a built-in "Ghost" sandbox for testing without spending real money.

---

## 🚀 "Beast" Features

- **⚡ Ultra-Speed Bulk Engine**: Process 200+ data or airtime orders in under 1 minute with parallel concurrency control.
- **👻 Ghost Sandbox**: Test every scenario (Success, Low Balance, Gateway Error) without an API key.
- **🛡️ Auto-Security Shield**:
    - **Price Auditing**: Prevents tampering by cross-checking wholesale prices before transactions.
    - **Credential Redaction**: Automatically scrubs sensitive API keys and phone numbers from logs.
    - **Nigerian Phone Validation**: Built-in validation for MTN, Airtel, Glo, and 9Mobile numbers.
- **📈 Smart Margin Engine**: Set your profit margin (flat or percentage) and the SDK handles the math for your retail prices.
- **🔄 Auto-Retry Engine**: Intelligent exponential backoff for handling temporary gateway errors (5xx).
- **📉 Low Balance Alerts**: Get notified automatically when your wallet balance drops below your threshold.

---

## 📦 Installation

```bash
npm install mozosubz
```

---

## 🛠️ Getting Started (Sandbox Mode)

No API key? No problem. Test the SDK immediately using the Sandbox mode.

```typescript
import { MozoSubz } from 'mozosubz';

const mozo = new MozoSubz({
  apiKey: 'YOUR_API_KEY', // Not needed for sandbox
  sandbox: true,          // Enable sandbox
  debug: true,            // See the Beast in action
  margin: { type: 'flat', value: 50 } // Add 50 Naira profit to every plan
});

// 1. Fetch plans with your retail price already calculated
const plans = await mozo.getPlans('mtn_sme');
console.log(`Retail Price: ₦${plans[0].retailPrice}`);

// 2. Buy Airtime
const response = await mozo.buyAirtime('08140558898', 100, 'mtn');
if (response.status === 'TRANSACTION_SUCCESSFUL') {
  console.log('✅ Success! TransID:', response.content.transactionID);
}
```

---

## 🌪️ Bulk Operations (Beast Mode)

Send data or airtime to hundreds of people at once.

```typescript
const bulkOrders = [
  { phone: '08140558801', serviceID: 'mtn_sme', plan: '179' },
  { phone: '08140558802', serviceID: 'glo_data', plan: '500' },
  // ... up to 1000s of orders
];

const results = await mozo.bulkBuy(bulkOrders);
console.log(`Done! ${results.filter(r => r.success).length} orders succeeded.`);
```

---

## 📟 Testing on Termux

The SDK is fully compatible with Node.js on Termux.

1. Install Node.js: `pkg install nodejs`
2. Create your project: `npm init -y`
3. Install the Beast: `npm install mozosubz`
4. Run your script: `node your-script.js`

---

## 🛡️ Security Best Practices

1. **Never expose your API Key** on the frontend. This SDK is intended for Server-Side use (Node.js, Next.js, etc.).
2. Use **Environment Variables** for your API key.
3. Enable **Debug Mode** in development to trace request/response cycles.

---

## 📜 License

MIT © Jules
