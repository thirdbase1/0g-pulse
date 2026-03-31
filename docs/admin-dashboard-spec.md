# MozoSubz Admin Dashboard Specification 🦁

This document details the UI layout and core functionalities of the **MozoSubz Admin Dashboard**, designed to leverage the "Beast" features of the MozoSubz SDK.

---

## 🖼️ Dashboard Layout & Navigation

```mermaid
graph TD
    A[Admin Login] --> B[Dashboard Overview]
    B --> C[Service Management]
    B --> D[Bulk Order Console]
    B --> E[Transaction Logs]
    B --> F[Wallet & Security Settings]

    subgraph "Overview"
        B1[Wallet Balance Widget]
        B2[Today's Profit Widget]
        B3[Service Status Widget]
        B4[Quick Buy Shortcuts]
    end

    subgraph "Service Management"
        C1[MTN/Airtel/Glo/9mobile Tabs]
        C2[Plan Retail Price Editor]
        C3[Margin Rule Toggle]
        C4[Service On/Off Switch]
    end

    subgraph "Bulk Order Console"
        D1[CSV Upload / Manual Entry]
        D2[Parallelism Lane Slider]
        D3[Live Progress Feed]
        D4[Failure Export (Retry List)]
    end

    subgraph "Transaction Logs"
        E1[Search by Phone/TransID]
        E2[Filter by Success/Failed]
        E3[View API Payload (Redacted)]
        E4[Manual Verification Button]
    end

    subgraph "Wallet & Security"
        F1[API Key Configuration]
        F2[Low Balance Alert Threshold]
        F3[Sandbox Mode Toggle]
        F4[Webhook URL Endpoint]
    end
```

---

## ⚙️ Core Module Functionalities

### 1. **Dashboard Overview**
- **Wallet Balance**: Real-time sync with `mozo.getBalance()`. Displays a red badge if below threshold.
- **Service Status**: Visual indicator of GSUBZ's network health based on recent transaction success rates.
- **Quick Buy**: Rapid airtime/data injection for emergency customer requests.

### 2. **Service Management**
- **Retail Price Calculation**: Automates the mapping of `wholesale + margin = retail`. Uses the SDK's `getPlans()` method.
- **Margin Engine**: A master switch to apply flat fees (e.g., +₦50) or percentage (e.g., +5%) globally.
- **Price Audit Shield**: Configure the threshold for the SDK's internal Price Audit to prevent selling below cost during network maintenance.

### 3. **The Beast: Bulk Order Console**
- **CSV Processing**: Drag-and-drop a list of 200+ phone numbers and plans.
- **Concurrency Control**: A slider that adjusts the `concurrency` parameter of the SDK's `bulkBuy()` method (1 to 20 lanes).
- **Progress Stream**: A real-time log that shows each order's success or failure *as it happens*.
- **Post-Job Cleanup**: Download a list of only failed orders to investigate or retry.

### 4. **Transaction History & Verification**
- **Beast Logs**: Every transaction is logged locally with its `requestID`.
- **Manual Verification**: A "Verify Now" button on every log that calls `mozo.verifyTransaction(requestId)` to force a status sync with GSUBZ.
- **Redaction Protection**: Developers can see the JSON request/response, but the SDK's auto-redaction ensures API keys and full phone numbers aren't leaked in the UI.

### 5. **Wallet & Security Settings**
- **Sandbox Toggle**: Instantly switch the entire dashboard between Live and "Ghost" modes for safe staff training.
- **Notification Webhooks**: Configure a URL for the "Webhook Shield" to receive and verify status updates.
- **Low Balance Alerting**: Set a threshold (e.g., ₦1,000) for automatic dashboard warnings.

---

## 🛠️ SDK Integration Map

| Dashboard UI Component | MozoSubz SDK Method |
| :--- | :--- |
| Balance Widget | `getBalance()` |
| Plan Table (Retail) | `getPlans(serviceID)` + `margin` |
| Buy Button | `buyData()` or `buyAirtime()` |
| Bulk Start Button | `bulkBuy(orders)` |
| Status Verify Button | `verifyTransaction(requestId)` |
| Webhook Listener | `verifyWebhook(payload)` |

---

## 📈 Suggested "Beast" Enhancements for UI
1. **The "Flash-Sync"**: A button to instantly clear the plan cache and refetch fresh wholesale prices from GSUBZ.
2. **Profit Forecaster**: Uses the margin settings to predict daily profit based on historical volume.
3. **Ghost Testing Center**: A dedicated tab for triggering Sandbox special phone numbers to test UI error handling (e.g., "Simulate 402 Error").
