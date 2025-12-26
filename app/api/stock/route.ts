import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Provider from '@/models/providerModel';
import Order from '@/models/orderModel';

export const dynamic = 'force-dynamic';

// Orders expire after 5 minutes if not paid
const ORDER_EXPIRY_MINUTES = 2;

// Cleanup old reserved orders and release accounts
async function cleanupExpiredOrders() {
  try {
    const expiryTime = new Date(Date.now() - ORDER_EXPIRY_MINUTES * 60 * 1000);
    
    // Find expired pending orders
    const expiredOrders = await Order.find({
      paymentStatus: 'pending',
      createdAt: { $lt: expiryTime }
    });

    if (expiredOrders.length > 0) {
      console.log(`Cleaning up ${expiredOrders.length} expired orders`);
      
      for (const order of expiredOrders) {
        // Release accounts back to available
        if (order.accounts && order.accounts.length > 0) {
          await Account.updateMany(
            { _id: { $in: order.accounts } },
            { status: 'available', orderId: null }
          );
        }
        
        // Mark order as failed/expired
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        await order.save();
      }
      
      console.log(`Released ${expiredOrders.length} expired orders`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

export async function GET() {
  try {
    await connectDB();

    // Run cleanup on each stock check (simple way to keep things clean)
    await cleanupExpiredOrders();

    // Count available accounts (not reserved or sold)
    const stock = await Account.countDocuments({ status: 'available' });

    // Get IRCTC provider price (or first active provider, or default 199)
    let pricePerID = 199;
    
    const provider = await Provider.findOne({ 
      slug: 'irctc',
      isActive: true 
    });
    
    if (provider && provider.price) {
      pricePerID = provider.price;
    } else {
      // Fallback: get first active provider
      const anyProvider = await Provider.findOne({ isActive: true });
      if (anyProvider && anyProvider.price) {
        pricePerID = anyProvider.price;
      }
    }

    return NextResponse.json({
      success: true,
      stock,
      pricePerID,
    });
  } catch (error: any) {
    console.error('Stock fetch error:', error);
    return NextResponse.json(
      { success: false, stock: 0, pricePerID: 199, message: error.message },
      { status: 500 }
    );
  }
}
