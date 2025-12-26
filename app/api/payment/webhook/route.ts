import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/orderModel';
import Account from '@/models/accountModel';

// UPI Gateway Webhook Handler
export async function POST(request: NextRequest) {
  console.log('[WEBHOOK] UPI Gateway webhook received');

  try {
    await connectDB();

    const body = await request.json();
    
    console.log('[WEBHOOK] Payload:', JSON.stringify(body, null, 2));

    const { 
      client_txn_id,
      status,
      upi_txn_id,
      amount,
      remark,
    } = body;

    if (!client_txn_id) {
      console.error('[WEBHOOK] Missing client_txn_id');
      return NextResponse.json({ success: false, message: 'Invalid webhook' });
    }

    // Find order by transaction ID
    const order = await Order.findOne({ orderId: client_txn_id });

    if (!order) {
      console.error(`[WEBHOOK] Order not found: ${client_txn_id}`);
      return NextResponse.json({ success: false, message: 'Order not found' });
    }

    // Check if already processed
    if (order.paymentStatus === 'completed') {
      console.log(`[WEBHOOK] Order ${client_txn_id} already processed`);
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    const statusLower = (status || '').toLowerCase();

    if (statusLower === 'success') {
      console.log(`[WEBHOOK] Payment successful for order: ${client_txn_id}`);
      
      // Payment successful
      order.paymentStatus = 'completed';
      order.status = 'delivered';
      order.credentialsRevealed = true;
      order.revealedAt = new Date();
      order.transactionId = upi_txn_id || '';
      order.upiTxnId = upi_txn_id || '';
      order.paymentDetails = {
        client_txn_id,
        upi_txn_id,
        amount,
        remark,
        status: 'success',
        ...body
      };
      await order.save();

      // Mark accounts as sold
      if (order.accounts && order.accounts.length > 0) {
        await Account.updateMany(
          { _id: { $in: order.accounts } },
          { 
            status: 'sold',
            soldAt: new Date(),
          }
        );
        console.log(`[WEBHOOK] Marked ${order.accounts.length} accounts as sold`);
      } else if (order.account) {
        // Single account (for dashboard purchases)
        await Account.findByIdAndUpdate(
          order.account,
          { 
            status: 'sold',
            soldAt: new Date(),
          }
        );
        console.log(`[WEBHOOK] Marked 1 account as sold`);
      }

      return NextResponse.json({ success: true, message: 'Payment confirmed' });
    } 
    else if (statusLower === 'failure' || statusLower === 'failed' || statusLower === 'expired') {
      console.log(`[WEBHOOK] Payment failed for order: ${client_txn_id} (status: ${status})`);
      
      // Payment failed or expired - release accounts back to stock
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      order.paymentDetails = {
        client_txn_id,
        upi_txn_id,
        amount,
        remark,
        status: statusLower,
        ...body
      };
      await order.save();

      // Release accounts back to available
      if (order.accounts && order.accounts.length > 0) {
        await Account.updateMany(
          { _id: { $in: order.accounts } },
          { status: 'available', orderId: null }
        );
        console.log(`[WEBHOOK] Released ${order.accounts.length} accounts for failed order ${client_txn_id}`);
      } else if (order.account) {
        // Single account
        await Account.findByIdAndUpdate(
          order.account,
          { status: 'available', orderId: null }
        );
        console.log(`[WEBHOOK] Released 1 account for failed order ${client_txn_id}`);
      }

      return NextResponse.json({ success: true, message: 'Payment failed, accounts released' });
    }
    
    else if (statusLower === 'pending' || statusLower === 'scanning') {
      console.log(`[WEBHOOK] Payment pending for order: ${client_txn_id}`);
      return NextResponse.json({ success: true, message: 'Payment pending' });
    }

    console.log(`[WEBHOOK] Unknown status for order ${client_txn_id}: ${status}`);
    return NextResponse.json({ success: true, message: 'Webhook received' });

  } catch (error: any) {
    console.error('[WEBHOOK] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
