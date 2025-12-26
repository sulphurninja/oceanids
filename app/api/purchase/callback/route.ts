import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Order from '@/models/orderModel';

// UPI Gateway Webhook/Callback Handler
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // UPI Gateway sends form-urlencoded data, not JSON
    const formData = await request.formData();
    
    const client_txn_id = formData.get('client_txn_id')?.toString();
    const status = formData.get('status')?.toString();
    const upi_txn_id = formData.get('upi_txn_id')?.toString();
    const txnAt = formData.get('txnAt')?.toString();
    
    console.log('[WEBHOOK] UPI Gateway Webhook received:');
    console.log('  - client_txn_id:', client_txn_id);
    console.log('  - status:', status);
    console.log('  - upi_txn_id:', upi_txn_id);

    if (!client_txn_id) {
      console.log('[WEBHOOK] No client_txn_id in webhook');
      return NextResponse.json({ success: false, message: 'Invalid callback' });
    }

    const order = await Order.findOne({ orderId: client_txn_id });

    if (!order) {
      console.log('[WEBHOOK] Order not found:', client_txn_id);
      return NextResponse.json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'completed') {
      console.log('[WEBHOOK] Order already completed');
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    const statusLower = (status || '').toLowerCase();

    if (statusLower === 'success') {
      console.log('[WEBHOOK] Payment confirmed for order:', client_txn_id);
      order.paymentStatus = 'completed';
      order.status = 'delivered';
      order.credentialsRevealed = true;
      order.revealedAt = new Date();
      order.transactionId = upi_txn_id || '';
      order.upiTxnId = upi_txn_id || '';
      order.paymentDetails = {
        client_txn_id,
        status,
        upi_txn_id,
        txnAt,
      };
      await order.save();

      // Mark accounts as sold
      await Account.updateMany(
        { _id: { $in: order.accounts } },
        { 
          status: 'sold',
          soldAt: new Date(),
        }
      );

      console.log('[WEBHOOK] Order marked as completed, accounts marked as sold');
      return NextResponse.json({ success: true, message: 'Payment confirmed' });
    } else if (statusLower === 'failure' || statusLower === 'failed' || statusLower === 'expired') {
      console.log('[WEBHOOK] Payment failed/expired for order:', client_txn_id);
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      order.paymentDetails = {
        client_txn_id,
        status,
        upi_txn_id,
        txnAt,
      };
      await order.save();

      // Release accounts back to available
      await Account.updateMany(
        { _id: { $in: order.accounts } },
        { status: 'available', orderId: null }
      );

      console.log(`[WEBHOOK] Released ${order.accounts?.length || 0} accounts for failed order ${client_txn_id}`);
      return NextResponse.json({ success: true, message: 'Payment failed, accounts released' });
    }

    return NextResponse.json({ success: true, message: 'Callback received' });

  } catch (error: any) {
    console.error('[WEBHOOK] Error:', error);
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
