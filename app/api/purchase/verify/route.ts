import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Order from '@/models/orderModel';

export const dynamic = 'force-dynamic';

// Orders expire after 5 minutes if not paid
const ORDER_EXPIRY_MINUTES = 2;

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    let orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID required' },
        { status: 400 }
      );
    }

    // Clean up orderId - remove any fragments or extra characters
    orderId = orderId.split('#')[0].trim()

    // Find the order
    const order = await Order.findOne({ orderId }).populate('accounts');

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order has expired (pending for too long)
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    const orderAgeMinutes = orderAge / (1000 * 60);

    if (order.paymentStatus === 'pending' && orderAgeMinutes > ORDER_EXPIRY_MINUTES) {
      // Order expired - release accounts
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      await order.save();

      await Account.updateMany(
        { _id: { $in: order.accounts } },
        { status: 'available', orderId: null }
      );

      return NextResponse.json({
        success: false,
        pending: false,
        message: 'Order expired. Please try again.',
      });
    }

    // Check if already completed
    if (order.paymentStatus === 'completed' && order.credentialsRevealed) {
      // Return credentials
      const accounts = order.accounts.map((acc: any) => ({
        username: acc.username,
        password: acc.password,
        mobileNumber: acc.mobileNumber || '',
        email: acc.email || '',
        emailPassword: acc.emailPassword || '',
      }));

      return NextResponse.json({
        success: true,
        accounts,
        orderId: order.orderId,
      });
    }

    // If already failed, return error
    if (order.paymentStatus === 'failed') {
      return NextResponse.json({
        success: false,
        pending: false,
        message: 'Payment failed',
      });
    }

    // Check payment status with UPI Gateway directly
    const upiGatewayKey = process.env.UPI_GATEWAY_KEY;

    if (upiGatewayKey) {
      console.log('[VERIFY] Checking with UPI Gateway for order:', orderId);

      try {
        // Format date as DD-MM-YYYY
        const d = new Date(order.createdAt);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const txnDate = `${day}-${month}-${year}`;

        const verifyResponse = await fetch('https://api.ekqr.in/api/check_order_status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: upiGatewayKey,
            client_txn_id: orderId,
            txn_date: txnDate,
          }),
        });

        const verifyData = await verifyResponse.json();
        console.log('[VERIFY] UPI Gateway response:', JSON.stringify(verifyData, null, 2));

        if (verifyData.status && verifyData.data?.status === 'success') {
          // Payment successful - mark as completed
          console.log('[VERIFY] Payment confirmed by UPI Gateway');
          order.paymentStatus = 'completed';
          order.status = 'delivered';
          order.credentialsRevealed = true;
          order.revealedAt = new Date();
          order.transactionId = verifyData.data.upi_txn_id || '';
          order.upiTxnId = verifyData.data.upi_txn_id || '';
          order.paymentDetails = verifyData.data;
          await order.save();

          // Mark accounts as sold
          await Account.updateMany(
            { _id: { $in: order.accounts } },
            {
              status: 'sold',
              soldAt: new Date(),
            }
          );

          return returnCredentials(order);
        } else if (verifyData.data?.status === 'pending' || verifyData.data?.status === 'scanning') {
          // Still pending
          console.log('[VERIFY] Payment still pending');
          return NextResponse.json({
            success: false,
            pending: true,
            message: 'Payment still processing',
          });
        } else {
          // Payment failed
          console.log('[VERIFY] Payment failed or expired');
          order.paymentStatus = 'failed';
          order.status = 'cancelled';
          await order.save();

          await Account.updateMany(
            { _id: { $in: order.accounts } },
            { status: 'available', orderId: null }
          );

          return NextResponse.json({
            success: false,
            pending: false,
            message: 'Payment failed or expired',
          });
        }
      } catch (upiError) {
        console.error('[VERIFY] UPI Gateway error:', upiError);
      }
    }

  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Verification error' },
      { status: 500 }
    );
  }
}

async function returnCredentials(order: any) {
  await order.populate('accounts');

  const accounts = order.accounts.map((acc: any) => ({
    username: acc.username,
    password: acc.password,
    mobileNumber: acc.mobileNumber || '',
    email: acc.email || '',
    emailPassword: acc.emailPassword || '',
  }));

  return NextResponse.json({
    success: true,
    accounts,
    orderId: order.orderId,
  });
}

function formatDate(date: Date): string {
  // Format: DD-MM-YYYY for UPI Gateway
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}
