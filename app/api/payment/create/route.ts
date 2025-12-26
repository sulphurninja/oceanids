import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Order from '@/models/orderModel';
import User from '@/models/userModel';
import Provider from '@/models/providerModel';
import { getUserFromRequest } from '@/lib/auth';
import crypto from 'crypto';

// Default price - all accounts are ₹199
const DEFAULT_PRICE = 199;

function generateOrderId() {
  return 'TXN_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function getAdminSetPrice(provider: string = 'irctc'): Promise<number> {
  // Get price from Provider model (admin-set)
  const providerConfig = await Provider.findOne({ 
    slug: provider,
    isActive: true 
  });
  
  if (providerConfig && providerConfig.price) {
    return providerConfig.price;
  }
  
  return DEFAULT_PRICE;
}

export async function POST(request: NextRequest) {
  try {
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { provider = 'irctc', accountType = 'standard' } = body;

    // Find an available account (by provider or accountType for backwards compatibility)
    const availableAccount = await Account.findOne({
      $or: [
        { provider, status: 'available' },
        { accountType, status: 'available' }
      ],
      status: 'available'
    });

    if (!availableAccount) {
      return NextResponse.json(
        { success: false, message: 'Account out of stock' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findById(tokenUser.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // ALWAYS use admin-set price from Provider, not individual account price
    const amount = await getAdminSetPrice(provider);
    const orderId = generateOrderId();

    // Reserve the account
    availableAccount.status = 'reserved';
    await availableAccount.save();

    // Create order
    const order = await Order.create({
      orderId,
      user: user._id,
      account: availableAccount._id,
      accountType: availableAccount.accountType || accountType,
      provider: availableAccount.provider || provider,
      amount,
      customerEmail: user.email,
      customerName: user.name,
      clientTxnId: orderId,
      paymentMethod: 'upi',
    });

    // Update account with order reference
    availableAccount.orderId = order._id;
    await availableAccount.save();

    // Create UPI Gateway payment request
    const upiGatewayKey = process.env.UPI_GATEWAY_KEY;
    
    if (!upiGatewayKey) {
      return NextResponse.json(
        { success: false, message: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || process.env.NEXT_PUBLIC_APP_URL || '';

    const upiResponse = await fetch('https://api.ekqr.in/api/create_order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: upiGatewayKey,
        client_txn_id: orderId,
        amount: Math.ceil(amount).toString(),
        p_info: 'IRCTC ID',
        customer_name: 'User',
        customer_email: 'user@example.com',
        customer_mobile: '8004277632',
        redirect_url: `${appUrl}/api/purchase/callback`,
        udf1: 'N/A',
        udf2: 'N/A',
        udf3: 'N/A',
      }),
    });

    const upiData = await upiResponse.json();

    if (upiData.status && upiData.data?.payment_url) {
      // Save gateway order ID
      order.gatewayOrderId = upiData.data.order_id?.toString() || '';
      order.paymentStatus = 'pending';
      await order.save();

      return NextResponse.json({
        success: true,
        orderId: order._id,
        paymentUrl: upiData.data.payment_url,
        upiIntents: upiData.data.upi_intent || {},
      });
    }

    // Payment creation failed, release the account
    availableAccount.status = 'available';
    availableAccount.orderId = null;
    await availableAccount.save();
    await Order.findByIdAndDelete(order._id);

    return NextResponse.json(
      { success: false, message: upiData.msg || 'Failed to create payment' },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Payment create error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating payment' },
      { status: 500 }
    );
  }
}
