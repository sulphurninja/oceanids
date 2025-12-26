import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Order from '@/models/orderModel';

export const dynamic = 'force-dynamic';

/**
 * Cancel endpoint to release reserved IDs
 * Called when user leaves the page during pending payment (client-side tracking)
 */
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

    // Clean up orderId
    orderId = orderId.split('#')[0].trim();

    // Find the order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Only cancel if payment is still pending
    if (order.paymentStatus !== 'pending') {
      return NextResponse.json({
        success: false,
        message: `Cannot cancel order with status: ${order.paymentStatus}`,
      });
    }

    console.log('[CANCEL] User left page, releasing reserved IDs for order:', orderId);

    // Release accounts back to available
    const updateResult = await Account.updateMany(
      { _id: { $in: order.accounts } },
      { status: 'available', orderId: null }
    );

    // Mark order as cancelled
    order.paymentStatus = 'cancelled';
    order.status = 'cancelled';
    await order.save();

    console.log(`[CANCEL] Released ${updateResult.modifiedCount} accounts for order ${orderId}`);

    return NextResponse.json({
      success: true,
      message: `Released ${updateResult.modifiedCount} accounts`,
      releasedCount: updateResult.modifiedCount,
    });
  } catch (error: any) {
    console.error('[CANCEL] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

