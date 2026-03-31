import { NextRequest, NextResponse } from 'next/server';
import { MozoSubz } from '@/lib/mozosubz';

// Initialize the Beast SDK
// In a real app, you would use process.env.MOZOSUBZ_API_KEY
const mozo = new MozoSubz({
  apiKey: process.env.MOZOSUBZ_API_KEY || 'SANDBOX_MODE',
  sandbox: !process.env.MOZOSUBZ_API_KEY, // Auto-enable sandbox if no key is found
  debug: true
});

export async function GET() {
  try {
    const balance = await mozo.getBalance();
    return NextResponse.json({
      success: true,
      balance,
      message: 'MozoSubz Beast SDK is ready!'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, amount, serviceID, planId, bulkOrders } = body;

    switch (action) {
      case 'airtime':
        const airtime = await mozo.buyAirtime(phone, amount, serviceID);
        return NextResponse.json(airtime);

      case 'data':
        const data = await mozo.buyData(phone, planId, serviceID);
        return NextResponse.json(data);

      case 'bulk':
        const results = await mozo.bulkBuy(bulkOrders);
        return NextResponse.json({ success: true, results });

      case 'plans':
        const plans = await mozo.getPlans(serviceID);
        return NextResponse.json(plans);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
