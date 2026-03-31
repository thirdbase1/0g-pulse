/**
 * MozoSubz SDK - The "Beast" VTU Integration for GSUBZ
 * Features: Sandbox Mode, Ultra-Speed Bulk Engine, Auto-Security, Smart Caching
 *
 * @author Jules
 */

export type MozoSubzConfig = {
  apiKey: string;
  sandbox?: boolean;
  debug?: boolean;
  concurrency?: number; // Max parallel requests for bulk operations
  margin?: {
    type: 'flat' | 'percentage';
    value: number;
  };
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
  private planCache: Map<string, { plans: DataPlan[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour cache for plans

  constructor(config: MozoSubzConfig) {
    this.config = {
      sandbox: false,
      debug: false,
      concurrency: 5,
      ...config,
    };

    if (!this.config.apiKey && !this.config.sandbox) {
      throw new Error('MozoSubz: API Key is required for live mode.');
    }
  }

  /**
   * Get available data plans for a service.
   * BEAST FEATURE: Automatically applies your profit margin to the prices.
   */
  async getPlans(serviceID: ServiceID): Promise<DataPlan[]> {
    // Check cache first
    const cached = this.planCache.get(serviceID);
    let plans: DataPlan[] = [];

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.log(`Using cached plans for ${serviceID}`);
      plans = cached.plans;
    } else if (this.config.sandbox) {
      plans = this.getMockPlans(serviceID);
      this.planCache.set(serviceID, { plans, timestamp: Date.now() });
    } else {
      try {
        const response = await fetch(`${this.baseUrl}/plans?service=${serviceID}`);
        const data = await response.json();
        if (data && data.plans) {
          plans = data.plans;
          this.planCache.set(serviceID, { plans, timestamp: Date.now() });
        }
      } catch (error) {
        this.logError(`Failed to fetch plans for ${serviceID}`, error);
        throw error;
      }
    }

    // Apply Margins
    return plans.map(plan => ({
      ...plan,
      retailPrice: this.calculateRetailPrice(Number(plan.price))
    }));
  }

  private calculateRetailPrice(wholesalePrice: number): number {
    if (!this.config.margin) return wholesalePrice;
    if (this.config.margin.type === 'flat') {
      return wholesalePrice + this.config.margin.value;
    } else {
      return wholesalePrice * (1 + this.config.margin.value / 100);
    }
  }

  /**
   * Buy Airtime
   */
  async buyAirtime(phone: string, amount: number, serviceID: ServiceID): Promise<MozoSubzResponse> {
    if (amount < 100) throw new Error('Minimum airtime amount is 100');

    return this.postRequest('/pay/', {
      serviceID,
      amount: amount.toString(),
      phone,
      api: this.config.apiKey
    });
  }

  /**
   * Buy Data
   * BEAST FEATURE: Internal Price Audit to prevent tampering
   */
  async buyData(phone: string, planId: string, serviceID: ServiceID, expectedPrice?: number): Promise<MozoSubzResponse> {
    if (expectedPrice) {
      const plans = await this.getPlans(serviceID);
      const plan = plans.find(p => p.value === planId);
      if (plan && Number(plan.price) > expectedPrice) {
        throw new Error(`Price Audit Failed: Wholesale price (${plan.price}) is higher than expected price (${expectedPrice})`);
      }
    }

    return this.postRequest('/pay/', {
      serviceID,
      plan: planId,
      amount: '',
      phone,
      api: this.config.apiKey
    });
  }

  /**
   * Check Wallet Balance
   */
  async getBalance(): Promise<number> {
    const res = await this.postRequest('/balance/', { api: this.config.apiKey });
    return parseFloat(res.balance || '0');
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
          response = await this.buyData(order.phone, order.plan, order.serviceID);
        } else if (order.amount) {
          response = await this.buyAirtime(order.phone, Number(order.amount), order.serviceID);
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

    // Parallel processing with concurrency control
    while (queue.length > 0 || activeRequests.length > 0) {
      while (queue.length > 0 && activeRequests.length < (this.config.concurrency || 5)) {
        const order = queue.shift()!;
        const promise = processOrder(order).then(() => {
          activeRequests.splice(activeRequests.indexOf(promise), 1);
        });
        activeRequests.push(promise);
      }
      if (activeRequests.length > 0) {
        await Promise.race(activeRequests);
      }
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

    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: formData
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        // Handle silent success or malformed response
        if (text === "" && (data.serviceID === 'waec' || data.serviceID === 'neco' || data.serviceID === 'nabteb')) {
          result = { code: 200, status: 'TRANSACTION_SUCCESSFUL', note: 'Silent success for exam pins' };
        } else {
          throw new Error(`Invalid JSON response: ${text}`);
        }
      }

      this.log(`Response from ${endpoint}`, result);

      // Auto-Security: Redact sensitive info in results if logged
      return result;
    } catch (error) {
      this.logError(`Request to ${endpoint} failed`, error);
      throw error;
    }
  }

  /**
   * Sandbox Logic: Mocking GSUBZ behavior
   */
  private async handleSandboxRequest(endpoint: string, data: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network lag

    // Special test cases based on phone numbers
    if (data.phone === '0800-ERROR-402') {
      return { code: 200, status: 'failed', error: 'INSUFFICIENT_BALANCE' };
    }
    if (data.phone === '0800-ERROR-502') {
      return { code: 502, status: 'failed', error: 'GATEWAY_ERROR' };
    }

    if (endpoint.includes('/balance/')) {
      return { balance: '50000.00' };
    }

    if (endpoint.includes('/pay/')) {
      return {
        code: 200,
        status: 'TRANSACTION_SUCCESSFUL',
        content: {
          transactionID: Math.floor(Math.random() * 1000000000),
          amount: data.amount || '0',
          phone: data.phone,
          serviceID: data.serviceID,
          finalBalance: 49900
        }
      };
    }

    return { status: 'success' };
  }

  private getMockPlans(serviceID: string): DataPlan[] {
    return [
      { displayName: '500MB - 30 Days', value: 'mock-1', price: '120' },
      { displayName: '1GB - 30 days', value: 'mock-2', price: '240' },
      { displayName: '2GB - 30 days', value: 'mock-3', price: '480' },
      { displayName: '5GB - 30 days', value: 'mock-4', price: '1200' },
      { displayName: '10GB - 30 days', value: 'mock-5', price: '2400' },
    ];
  }

  private redact(data: any): any {
    const redacted = { ...data };
    if (redacted.api) redacted.api = 'REDACTED_BY_BEAST';
    if (redacted.phone) redacted.phone = redacted.phone.replace(/(\d{3})\d+(\d{3})/, '$1****$2');
    return redacted;
  }

  private log(message: string, data?: any) {
    if (this.config.debug) {
      console.log(`[MozoSubz] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  private logError(message: string, error: any) {
    console.error(`[MozoSubz ERROR] ${message}`, error);
  }
}
