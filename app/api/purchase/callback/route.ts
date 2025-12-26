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
    let orderId = searchParams.get('client_txn_id') || searchParams.get('order_id');
    let status = searchParams.get('status');

    console.log('[CALLBACK] Raw URL:', request.url);
    console.log('[CALLBACK] Order ID:', orderId, 'Status:', status);

    // If URL has malformed query string (multiple ?), extract order_id from path
    if (!orderId && request.url.includes('?')) {
      const urlStr = request.url;
      const match = urlStr.match(/order_id=([^&?]+)/);
      orderId = match ? match[1] : null;
      
      // Also try to get status
      const statusMatch = urlStr.match(/status=([^&?]+)/);
      status = statusMatch ? statusMatch[1] : status;
    }

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

        console.log(`[CALLBACK] Released accounts for failed order ${orderId}`);
      }
    }

    if (orderId) {
      // Clean up the order ID for URL (remove any extra params)
      const cleanOrderId = orderId.split('&')[0];
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || '';
      const finalStatus = status || 'success';
      
      // Construct URL properly
      const redirectUrl = baseUrl 
        ? `${baseUrl}/?order_id=${encodeURIComponent(cleanOrderId)}&status=${encodeURIComponent(finalStatus)}`
        : `/?order_id=${encodeURIComponent(cleanOrderId)}&status=${encodeURIComponent(finalStatus)}`;
      
      console.log('[CALLBACK] Redirecting to:', redirectUrl);
      return NextResponse.redirect(redirectUrl);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || '';
    return NextResponse.redirect(baseUrl || '/');
  } catch (error) {
    console.error('[CALLBACK] Error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || '';
    return NextResponse.redirect(baseUrl || '/');
  }
}
