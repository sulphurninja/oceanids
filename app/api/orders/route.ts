import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/orderModel';
import Account from '@/models/accountModel';
import Provider from '@/models/providerModel';
import { getUserFromRequest } from '@/lib/auth';

// GET user's orders
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch user's orders with account details for completed orders
    const orders = await Order.find({ user: user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Get providers for mapping
    const providers = await Provider.find().lean();
    const providerMap = new Map(providers.map((p: any) => [p.slug, { name: p.name, slug: p.slug }]));

    // Fetch account details for completed orders
    const ordersWithDetails = await Promise.all(
      orders.map(async (order: any) => {
        let accountDetails = null;
        
        // Only show account credentials for completed orders
        if (order.paymentStatus === 'completed' && order.account) {
          const account = await Account.findById(order.account).lean();
          if (account) {
            accountDetails = {
              username: (account as any).username,
              password: (account as any).password,
            };
          }
        }

        // Get provider info
        const providerInfo = order.provider 
          ? providerMap.get(order.provider) || { name: order.provider, slug: order.provider }
          : order.accountType 
            ? { name: order.accountType, slug: order.accountType }
            : { name: 'IRCTC', slug: 'irctc' };

        return {
          _id: order._id,
          orderId: order.orderId,
          provider: providerInfo,
          accountType: order.accountType,
          amount: order.amount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          account: accountDetails,
          credentialsRevealed: order.credentialsRevealed || false,
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: ordersWithDetails
    });
  } catch (error: any) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching orders' },
      { status: 500 }
    );
  }
}
