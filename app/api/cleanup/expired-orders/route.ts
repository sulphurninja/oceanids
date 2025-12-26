import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Order from '@/models/orderModel';

export const dynamic = 'force-dynamic';

// Orders expire after 30 minutes if not paid
const ORDER_EXPIRY_MINUTES = 30;

/**
 * Cleanup endpoint for expired pending orders
 * Can be called by external cron services (e.g., EasyCron, Vercel Cron)
 * Or called periodically from other endpoints
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const expiryTime = new Date(Date.now() - ORDER_EXPIRY_MINUTES * 60 * 1000);
    
    // Find expired pending orders
    const expiredOrders = await Order.find({
      paymentStatus: 'pending',
      createdAt: { $lt: expiryTime }
    }).populate('accounts');

    if (expiredOrders.length > 0) {
      console.log(`[CLEANUP] Found ${expiredOrders.length} expired orders to clean up`);
      
      for (const order of expiredOrders) {
        // Release accounts back to available
        if (order.accounts && order.accounts.length > 0) {
          const accountCount = await Account.updateMany(
            { _id: { $in: order.accounts } },
            { status: 'available', orderId: null }
          );
          
          console.log(`[CLEANUP] Released ${accountCount.modifiedCount} accounts for order ${order.orderId}`);
        }
        
        // Mark order as failed/expired
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        await order.save();
      }
      
      console.log(`[CLEANUP] Successfully cleaned up ${expiredOrders.length} expired orders`);
    } else {
      console.log('[CLEANUP] No expired orders found');
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${expiredOrders.length} expired orders`,
      expiredOrdersCount: expiredOrders.length,
    });
  } catch (error: any) {
    console.error('[CLEANUP] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Cleanup error: ' + error.message 
      },
      { status: 500 }
    );
  }
}

