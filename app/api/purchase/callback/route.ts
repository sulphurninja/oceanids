import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Order from '@/models/orderModel';

// UPI Gateway Webhook/Callback
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    console.log('UPI Gateway Callback:', body);

    const { 
      client_txn_id,
      status,
      txnId,
      upi_txn_id,
    } = body;

    if (!client_txn_id) {
      return NextResponse.json({ success: false, message: 'Invalid callback' });
    }

    const order = await Order.findOne({ orderId: client_txn_id });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'completed') {
      // Already processed
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    const statusLower = (status || '').toLowerCase();

    if (statusLower === 'success') {
      // Payment successful
      order.paymentStatus = 'completed';
      order.status = 'delivered';
      order.credentialsRevealed = true;
      order.revealedAt = new Date();
      order.transactionId = txnId || '';
      order.upiTxnId = upi_txn_id || '';
      order.paymentDetails = body;
      await order.save();

      // Mark accounts as sold
      await Account.updateMany(
        { _id: { $in: order.accounts } },
        { 
          status: 'sold',
          soldAt: new Date(),
        }
      );

      return NextResponse.json({ success: true, message: 'Payment confirmed' });
    } else if (statusLower === 'failure' || statusLower === 'failed' || statusLower === 'expired') {
      // Payment failed or expired - release accounts back to stock
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      order.paymentDetails = body;
      await order.save();

      // Release accounts back to available
      await Account.updateMany(
        { _id: { $in: order.accounts } },
        { status: 'available', orderId: null }
      );

      console.log(`Released ${order.accounts?.length || 0} accounts for failed order ${client_txn_id}`);

      return NextResponse.json({ success: true, message: 'Payment failed, accounts released' });
    }

    return NextResponse.json({ success: true, message: 'Callback received' });

  } catch (error: any) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Also handle GET for redirect-based callbacks
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('client_txn_id') || searchParams.get('order_id');
    const status = searchParams.get('status');

    // If payment failed via redirect, release accounts
    if (orderId && status && status.toLowerCase() !== 'success') {
      const order = await Order.findOne({ orderId });
      
      if (order && order.paymentStatus === 'pending') {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        await order.save();

        await Account.updateMany(
          { _id: { $in: order.accounts } },
          { status: 'available', orderId: null }
        );

        console.log(`Released accounts for redirected failed order ${orderId}`);
      }
    }

    if (orderId) {
      // Redirect to main page with order details
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
      return NextResponse.redirect(`${baseUrl}?order_id=${orderId}&status=${status || 'success'}`);
    }

    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || '/');
  } catch (error) {
    console.error('Redirect callback error:', error);
    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || '/');
  }
}
