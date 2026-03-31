# 🦁 MozoSubz Beast Terminal - Termux Guide

This guide will show you how to set up and run the **Beast Terminal** on your mobile device using Termux to stress-test the real GSUBZ API.

---

## 🛠️ Step 1: Install Termux & Node.js

1.  Open Termux on your Android device.
2.  Install Node.js and Git:
    ```bash
    pkg update && pkg upgrade
    pkg install nodejs git
    ```

---

## 🚀 Step 2: Set Up the Beast Terminal

1.  Create a folder and navigate to it:
    ```bash
    mkdir mozosubz-test && cd mozosubz-test
    ```
2.  Initialize the project:
    ```bash
    npm init -y
    ```
3.  Install dependencies (including the SDK):
    ```bash
    npm install typescript ts-node mozosubz
    ```

---

## 🔥 Step 3: Run the Stress Test

To run the terminal against the real GSUBZ API with a live performance ticker, use the following command:

```bash
export API_KEY="YOUR_GSUBZ_API_KEY"
export PHONE="08140558898"
export CONCURRENCY=20
export TOTAL_REQUESTS=200

npx ts-node --esm scripts/beast-terminal.ts
```

### **Parameters Explained:**
-   `API_KEY`: Your real GSUBZ API key.
-   `PHONE`: The recipient phone number for the airtime test.
-   `CONCURRENCY`: The number of parallel "lanes" hitting the API at once.
-   `TOTAL_REQUESTS`: Total number of airtime requests to fire in the batch.

---

## 📊 Reading the Results

-   **ID**: Request number (e.g., #001, #002).
-   **STATUS**: `OK` (Successful), `FAIL` (GSUBZ returned failure), `ERROR` (Network or SDK error).
-   **LATENCY**: Time in milliseconds for that specific request to complete.
-   **BEAST REPORT**: Final summary of total time, Requests Per Second (RPS), and success/failure counts.

---

## ⚠️ Safety Notice
The Beast Terminal is designed for **High-Concurrency Stress Testing**.
1. **Empty Your Wallet**: Always ensure your GSUBZ wallet is empty or has a very low balance before running a batch of 200+ requests to avoid unintentional costs.
2. **Rate Limits**: GSUBZ may temporarily block your IP if you exceed their internal rate limits. Adjust `CONCURRENCY` accordingly.
