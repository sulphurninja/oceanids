import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Order from '@/models/orderModel';
import User from '@/models/userModel';
import { getUserFromRequest } from '@/lib/auth';
import axios from 'axios';
import crypto from 'crypto';

// Default price - all accounts are ₹400
const DEFAULT_PRICE = 400;

function generateOrderId() {
  return 'OID_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();
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

    // Use account's price or default to ₹400
    const amount = availableAccount.price || DEFAULT_PRICE;
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
    });

    // Update account with order reference
    availableAccount.orderId = order._id;
    await availableAccount.save();

    // Create Cashfree payment session
    const cashfreeUrl = process.env.CASHFREE_ENV === 'PRODUCTION'
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';

    const cashfreePayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: user._id.toString(),
        customer_email: user.email,
        customer_phone: user.phone || '9999999999',
        customer_name: user.name,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback?order_id=${orderId}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      },
    };

    const cashfreeResponse = await axios.post(cashfreeUrl, cashfreePayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
    });

    if (cashfreeResponse.data.payment_session_id) {
      order.gatewayOrderId = cashfreeResponse.data.cf_order_id;
      await order.save();

      return NextResponse.json({
        success: true,
        orderId: order._id,
        paymentSessionId: cashfreeResponse.data.payment_session_id,
        cfOrderId: cashfreeResponse.data.cf_order_id,
      });
    }

    // Payment creation failed, release the account
    availableAccount.status = 'available';
    availableAccount.orderId = null;
    await availableAccount.save();
    await Order.findByIdAndDelete(order._id);

    return NextResponse.json(
      { success: false, message: 'Failed to create payment session' },
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
