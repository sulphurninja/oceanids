import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Order from '@/models/orderModel';
import Provider from '@/models/providerModel';
import crypto from 'crypto';

const DEFAULT_PRICE = 199;

function generateOrderId() {
  return 'TXN' + Date.now() + crypto.randomBytes(3).toString('hex').toUpperCase();
}

async function getPricePerID(): Promise<number> {
  // Get IRCTC provider price (or first active provider, or default)
  const provider = await Provider.findOne({ 
    slug: 'irctc',
    isActive: true 
  });
  
  if (provider && provider.price) {
    return provider.price;
  }
  
  // Fallback: get first active provider
  const anyProvider = await Provider.findOne({ isActive: true });
  if (anyProvider && anyProvider.price) {
    return anyProvider.price;
  }
  
  return DEFAULT_PRICE;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { quantity = 1 } = body;

    if (quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { success: false, message: 'Invalid quantity' },
        { status: 400 }
      );
    }

    // Check available stock
    const availableCount = await Account.countDocuments({ status: 'available' });
    
    if (availableCount < quantity) {
      return NextResponse.json(
        { success: false, message: 'Not enough stock available' },
        { status: 400 }
      );
    }

    // Find and reserve accounts
    const availableAccounts = await Account.find({ status: 'available' })
      .limit(quantity)
      .select('_id');

    if (availableAccounts.length < quantity) {
      return NextResponse.json(
        { success: false, message: 'Not enough stock available' },
        { status: 400 }
      );
    }

    // Get admin-set price
    const pricePerID = await getPricePerID();

    const accountIds = availableAccounts.map(acc => acc._id);
    const amount = quantity * pricePerID;
    const orderId = generateOrderId();

    // Reserve the accounts
    await Account.updateMany(
      { _id: { $in: accountIds } },
      { status: 'reserved' }
    );

    // Create order
    const order = await Order.create({
      orderId,
      accounts: accountIds,
      quantity,
      amount,
      provider: 'irctc',
      accountType: 'irctc',
      clientTxnId: orderId,
      paymentMethod: 'upi',
    });

    // Update accounts with order reference
    await Account.updateMany(
      { _id: { $in: accountIds } },
      { orderId: order._id }
    );

    // Create UPI Gateway payment request
    // Using UPIGateway.com API
    const upiGatewayKey = process.env.UPI_GATEWAY_KEY;
    
    if (!upiGatewayKey) {
      // Fallback: Return direct UPI payment info
      // In production, integrate with actual gateway
      console.warn('UPI_GATEWAY_KEY not set, using test mode');
      
      return NextResponse.json({
        success: true,
        orderId: order.orderId,
        amount,
        quantity,
        pricePerID,
        // For testing: return a mock payment URL
        paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/purchase/test-payment?order_id=${orderId}&amount=${amount}`,
        testMode: true,
      });
    }

    // UPI Gateway API call
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}?order_id=${orderId}&status=success`;

    const upiResponse = await fetch('https://api.ekqr.in/api/create_order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: upiGatewayKey,
        client_txn_id: orderId,
        amount: amount.toString(),
        p_info: `${quantity} IRCTC ID${quantity > 1 ? 's' : ''}`,
        customer_name: 'Customer',
        customer_email: 'customer@example.com',
        customer_mobile: '9999999999',
        redirect_url: redirectUrl,
        udf1: '',
        udf2: '',
        udf3: '',
      }),
    });

    const upiData = await upiResponse.json();

    if (upiData.status && upiData.data?.payment_url) {
      // Save gateway order ID
      order.gatewayOrderId = upiData.data.order_id || '';
      await order.save();

      return NextResponse.json({
        success: true,
        orderId: order.orderId,
        amount,
        quantity,
        pricePerID,
        paymentUrl: upiData.data.payment_url,
      });
    }

    // Payment creation failed, release the accounts
    await Account.updateMany(
      { _id: { $in: accountIds } },
      { status: 'available', orderId: null }
    );
    await Order.findByIdAndDelete(order._id);

    return NextResponse.json(
      { success: false, message: upiData.msg || 'Failed to create payment' },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error processing purchase' },
      { status: 500 }
    );
  }
}
