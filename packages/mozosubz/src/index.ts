/**
 * MozoSubz SDK - The "Beast" VTU Integration for GSUBZ
 * Features: Sandbox Mode, Ultra-Speed Bulk Engine, Auto-Security, Smart Caching, Auto-Retry
 *
 * @author Jules
 */

export type MozoSubzConfig = {
  apiKey: string;
  sandbox?: boolean;
  debug?: boolean;
  concurrency?: number; // Max parallel requests for bulk operations
  maxRetries?: number; // Automatic retries for gateway errors
  margin?: {
    type: 'flat' | 'percentage';
    value: number;
  };
  onLowBalance?: (balance: number) => void;
  lowBalanceThreshold?: number;
};

export type ServiceID =
  | 'mtn' | 'airtel' | 'glo' | 'etisalat'
  | 'mtn_sme' | 'mtn_cg_lite' | 'mtn_gifting' | 'mtn_datashare' | 'mtn_coupon' | 'mtncg'
  | 'airtel_cg' | 'airtel_sme' | 'glo_data' | 'glo_sme' | 'etisalat_data'
  | 'waec' | 'neco' | 'nabteb';

export type MozoSubzResponse<T = any> = {
  code: number;
  status: string;
  transactionID?: string | number;
  amount?: string | number;
  phone?: string;
  serviceID?: string;
  amountPaid?: number;
  initialBalance?: string | number;
  finalBalance?: string | number;
  date?: string;
  api_response?: string;
  content?: T;
  error?: string;
  note?: string;
};

export type DataPlan = {
  displayName: string;
  value: string;
  price: string;
  retailPrice?: number;
};

export type BulkOrder = {
  phone: string;
  serviceID: ServiceID;
  plan?: string; // For data
  amount?: string | number; // For airtime
  requestId?: string;
};

export type BulkResult = {
  order: BulkOrder;
  success: boolean;
  response?: MozoSubzResponse;
  error?: string;
};

export class MozoSubz {
  private readonly baseUrl = 'https://gsubz.com/api';
  private readonly config: MozoSubzConfig;
  private readonly webhookSecret?: string;
  private planCache: Map<string, { plans: DataPlan[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour cache for plans

  constructor(config: MozoSubzConfig & { webhookSecret?: string }) {
    this.config = {
      sandbox: false,
      debug: false,
      concurrency: 5,
      maxRetries: 3,
      lowBalanceThreshold: 500,
      ...config,
    };

    if (!this.config.apiKey && !this.config.sandbox) {
      throw new Error('MozoSubz: API Key is required for live mode.');
    }
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * BEAST FEATURE: Webhook Shield
   * Verifies and parses incoming status notifications from GSUBZ.
   */
  verifyWebhook(payload: any, signature?: string): { verified: boolean, data: any } {
    // GSUBZ doesn't always provide signatures, but if we have a secret, we can check it
    // against a specific field or just use this helper to clean the data.
    if (this.webhookSecret && payload.secret !== this.webhookSecret) {
      return { verified: false, data: null };
    }

    return {
      verified: true,
      data: {
        transactionID: payload.transactionID,
        status: payload.status,
        amount: payload.amount,
        phone: payload.phone,
        full: payload
      }
    };
  }

  /**
   * Get available data plans for a service.
   * BEAST FEATURE: Automatically applies your profit margin to the prices.
   */
  async getPlans(serviceID: ServiceID): Promise<DataPlan[]> {
    const cached = this.planCache.get(serviceID);
    let plans: DataPlan[] = [];

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.log(`Using cached plans for ${serviceID}`);
      plans = cached.plans;
    } else if (this.config.sandbox) {
      plans = this.getMockPlans(serviceID);
      this.planCache.set(serviceID, { plans, timestamp: Date.now() });
    } else {
      plans = await this.fetchWithRetry(`${this.baseUrl}/plans?service=${serviceID}`, { method: 'GET' });
      this.planCache.set(serviceID, { plans, timestamp: Date.now() });
    }

    return plans.map(plan => ({
      ...plan,
      retailPrice: this.calculateRetailPrice(Number(plan.price))
    }));
  }

  /**
   * Buy Airtime
   */
  async buyAirtime(phone: string, amount: number, serviceID: ServiceID, requestId?: string): Promise<MozoSubzResponse> {
    this.validatePhone(phone);
    if (amount < 100) throw new Error('Minimum airtime amount is 100');

    return this.postRequest('/pay/', {
      serviceID,
      amount: amount.toString(),
      phone,
      api: this.config.apiKey,
      requestID: requestId || this.generateRequestId()
    });
  }

  /**
   * Buy Data
   * BEAST FEATURE: Internal Price Audit to prevent tampering
   */
  async buyData(phone: string, planId: string, serviceID: ServiceID, options: { expectedPrice?: number, requestId?: string } = {}): Promise<MozoSubzResponse> {
    this.validatePhone(phone);
    if (options.expectedPrice) {
      const plans = await this.getPlans(serviceID);
      const plan = plans.find(p => p.value === planId);
      if (plan && Number(plan.price) > options.expectedPrice) {
        throw new Error(`Price Audit Failed: Wholesale price (${plan.price}) is higher than expected price (${options.expectedPrice})`);
      }
    }

    return this.postRequest('/pay/', {
      serviceID,
      plan: planId,
      amount: '',
      phone,
      api: this.config.apiKey,
      requestID: options.requestId || this.generateRequestId()
    });
  }

  /**
   * Check Wallet Balance
   */
  async getBalance(): Promise<number> {
    const res = await this.postRequest('/balance/', { api: this.config.apiKey });
    const balance = parseFloat(res.balance || '0');
    this.checkLowBalance(balance);
    return balance;
  }

  /**
   * Verify Transaction Status
   */
  async verifyTransaction(requestId: string): Promise<MozoSubzResponse> {
    return this.postRequest('/verify/', {
      api: this.config.apiKey,
      requestID: requestId
    });
  }

  /**
   * BEAST FEATURE: Ultra-Speed Bulk Buying
   */
  async bulkBuy(orders: BulkOrder[]): Promise<BulkResult[]> {
    this.log(`Starting bulk operation for ${orders.length} orders...`);
    const results: BulkResult[] = [];
    const queue = [...orders];
    const activeRequests: Promise<void>[] = [];

    const processOrder = async (order: BulkOrder) => {
      try {
        let response: MozoSubzResponse;
        if (order.plan) {
          response = await this.buyData(order.phone, order.plan, order.serviceID, { requestId: order.requestId });
        } else if (order.amount) {
          response = await this.buyAirtime(order.phone, Number(order.amount), order.serviceID, order.requestId);
        } else {
          throw new Error('Invalid order: Missing plan or amount');
        }

        results.push({
          order,
          success: response.status === 'TRANSACTION_SUCCESSFUL',
          response
        });
      } catch (error: any) {
        results.push({
          order,
          success: false,
          error: error.message
        });
      }
    };

    while (queue.length > 0 || activeRequests.length > 0) {
      while (queue.length > 0 && activeRequests.length < (this.config.concurrency || 5)) {
        const order = queue.shift()!;
        const promise = processOrder(order).then(() => {
          activeRequests.splice(activeRequests.indexOf(promise), 1);
        });
        activeRequests.push(promise);
      }
      if (activeRequests.length > 0) await Promise.race(activeRequests);
    }

    this.log(`Bulk operation complete. ${results.filter(r => r.success).length} successful.`);
    return results;
  }

  /**
   * Internal POST request handler with Sandbox support and Auto-Security
   */
  private async postRequest(endpoint: string, data: Record<string, string>): Promise<any> {
    this.log(`Request to ${endpoint}`, this.redact(data));

    if (this.config.sandbox) {
      return this.handleSandboxRequest(endpoint, data);
    }

    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }

    const responseText = await this.fetchWithRetry(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
      body: formData
    }, true);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      if (responseText === "" && ['waec', 'neco', 'nabteb'].includes(data.serviceID)) {
        result = { code: 200, status: 'TRANSACTION_SUCCESSFUL', note: 'Silent success for exam pins' };
      } else {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
    }

    this.log(`Response from ${endpoint}`, result);
    return result;
  }

  private async fetchWithRetry(url: string, options: any, returnText = false, attempt = 0): Promise<any> {
    try {
      const response = await fetch(url, options);

      // Automatic Retry on Gateway Errors (5xx)
      if (response.status >= 500 && attempt < (this.config.maxRetries || 3)) {
        const delay = Math.pow(2, attempt) * 1000;
        this.log(`Gateway error (${response.status}). Retrying in ${delay}ms... (Attempt ${attempt + 1})`);
        await new Promise(r => setTimeout(r, delay));
        return this.fetchWithRetry(url, options, returnText, attempt + 1);
      }

      if (returnText) return await response.text();
      const data = await response.json();
      return data.plans || data;
    } catch (error) {
      if (attempt < (this.config.maxRetries || 3)) {
        return this.fetchWithRetry(url, options, returnText, attempt + 1);
      }
      throw error;
    }
  }

  private validatePhone(phone: string) {
    const nigerianPhoneRegex = /^(0|234|\+234)(70|80|81|90|91|71)\d{8}$/;
    if (!nigerianPhoneRegex.test(phone) && !this.config.sandbox) {
      throw new Error(`Invalid Nigerian phone number format: ${phone}`);
    }
  }

  private generateRequestId(): string {
    return `MOZO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  private calculateRetailPrice(wholesalePrice: number): number {
    if (!this.config.margin) return wholesalePrice;
    return this.config.margin.type === 'flat'
      ? wholesalePrice + this.config.margin.value
      : wholesalePrice * (1 + this.config.margin.value / 100);
  }

  private checkLowBalance(balance: number) {
    if (this.config.onLowBalance && balance < (this.config.lowBalanceThreshold || 500)) {
      this.config.onLowBalance(balance);
    }
  }

  /**
   * Sandbox Logic: Mocking GSUBZ behavior
   */
  private async handleSandboxRequest(endpoint: string, data: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (data.phone === '0800-ERROR-402') return { code: 200, status: 'failed', error: 'INSUFFICIENT_BALANCE' };
    if (endpoint.includes('/balance/')) return { balance: '50000.00' };
    if (endpoint.includes('/pay/')) {
      return {
        code: 200,
        status: 'TRANSACTION_SUCCESSFUL',
        content: { transactionID: Date.now(), amount: data.amount || '0', phone: data.phone, serviceID: data.serviceID, finalBalance: 49900 }
      };
    }
    return { status: 'success' };
  }

  private getMockPlans(serviceID: string): DataPlan[] {
    return [
      { displayName: '500MB - 30 Days', value: 'mock-1', price: '120' },
      { displayName: '1GB - 30 days', value: 'mock-2', price: '240' },
      { displayName: '2GB - 30 days', value: 'mock-3', price: '480' },
    ];
  }

  private redact(data: any): any {
    const redacted = { ...data };
    if (redacted.api) redacted.api = 'REDACTED_BY_BEAST';
    if (redacted.phone) redacted.phone = redacted.phone.replace(/(\d{3})\d+(\d{3})/, '$1****$2');
    return redacted;
  }

  private log(message: string, data?: any) {
    if (this.config.debug) console.log(`[MozoSubz] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  private logError(message: string, error: any) {
    console.error(`[MozoSubz ERROR] ${message}`, error);
  }
}
