import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/orderModel';
import Account from '@/models/accountModel';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  console.log('[WEBHOOK] Payment webhook received');

  try {
    await connectDB();

    const body = await request.text();
    const signature = request.headers.get('x-cashfree-signature');
    const timestamp = request.headers.get('x-cashfree-timestamp');

    if (!signature) {
      console.error('[WEBHOOK] Missing signature');
      return NextResponse.json(
        { success: false, message: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify signature
    const signatureData = timestamp + body;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.CASHFREE_SECRET_KEY!)
      .update(signatureData)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error('[WEBHOOK] Invalid signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      );
    }

    const data = JSON.parse(body);
    console.log('[WEBHOOK] Payload:', JSON.stringify(data, null, 2));

    if (data.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const payment = data.data;
      const orderId = payment.order.order_id;

      console.log(`[WEBHOOK] Payment successful for order: ${orderId}`);

      // Find order
      const order = await Order.findOne({ clientTxnId: orderId });
      if (!order) {
        console.error(`[WEBHOOK] Order not found: ${orderId}`);
        return NextResponse.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        );
      }

      // Update order
      order.status = 'confirmed';
      order.paymentStatus = 'completed';
      order.transactionId = payment.payment.cf_payment_id;
      order.paymentDetails = {
        cf_payment_id: payment.payment.cf_payment_id,
        payment_status: payment.payment.payment_status,
        payment_amount: payment.payment.payment_amount,
        payment_time: payment.payment.payment_time,
        payment_method: payment.payment.payment_method,
      };
      await order.save();

      // Update account status
      const account = await Account.findById(order.account);
      if (account) {
        account.status = 'sold';
        account.soldTo = order.user;
        account.soldAt = new Date();
        await account.save();
      }

      // Mark order as delivered (instant delivery)
      order.status = 'delivered';
      order.credentialsRevealed = true;
      order.revealedAt = new Date();
      await order.save();

      console.log(`[WEBHOOK] Order ${orderId} processed successfully`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[WEBHOOK] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

