const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3001;
const LATENCY = process.env.LATENCY || 200; // Simulated network lag in ms

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Add simulated latency
  setTimeout(() => {
    // 1. Get Plans Endpoint
    if (path === '/api/plans') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        service: "MTN-SME-Data",
        plans: [
          { displayName: "500MB - 30 Days", value: "179", price: "120" },
          { displayName: "1GB - 30 days", value: "166", price: "240" },
          { displayName: "2GB - 30 days", value: "167", price: "480" }
        ]
      }));
    }

    // 2. Buy (Pay) Endpoint
    if (path === '/api/pay/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        code: 200,
        status: "TRANSACTION_SUCCESSFUL",
        content: {
          transactionID: Math.floor(Math.random() * 1000000000),
          amount: "120",
          phone: "08140558898",
          finalBalance: 1280
        }
      }));
    }

    // 3. Balance Endpoint
    if (path === '/api/balance/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ balance: "747.5" }));
    }

    // 4. Verification Endpoint
    if (path === '/api/verify/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: "success", description: "TRANSACTION_SUCCESSFUL" }));
    }

    // 404
    res.writeHead(404);
    res.end();
  }, LATENCY);
});

server.listen(PORT, () => {
  console.log(`🦁 MozoSubz API Simulator running on http://localhost:${PORT}`);
  console.log(`Simulated Latency: ${LATENCY}ms`);
  console.log('Press Ctrl+C to stop.');
});
