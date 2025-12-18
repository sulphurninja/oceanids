import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Order from '@/models/orderModel';
import User from '@/models/userModel';
import Provider from '@/models/providerModel';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);


    await connectDB();

    // Get account stats
    const totalAccounts = await Account.countDocuments();
    const availableAccounts = await Account.countDocuments({ status: 'available' });
    const soldAccounts = await Account.countDocuments({ status: 'sold' });

    // Get stock by provider
    const stockByType: Record<string, { available: number; sold: number }> = {};
    const providers = await Provider.find({ isActive: true });
    
    for (const provider of providers) {
      const available = await Account.countDocuments({ provider: provider.slug, status: 'available' });
      const sold = await Account.countDocuments({ provider: provider.slug, status: 'sold' });
      
      if (available > 0 || sold > 0) {
        stockByType[provider.name] = { available, sold };
      }
    }

    // If no providers have stock, check for accounts with legacy string provider
    if (Object.keys(stockByType).length === 0) {
      const distinctProviders = await Account.distinct('provider');
      for (const providerSlug of distinctProviders) {
        const available = await Account.countDocuments({ provider: providerSlug, status: 'available' });
        const sold = await Account.countDocuments({ provider: providerSlug, status: 'sold' });
        
        if (available > 0 || sold > 0) {
          const provider = await Provider.findOne({ slug: providerSlug });
          stockByType[provider?.name || providerSlug] = { available, sold };
        }
      }
    }

    // Get order stats
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.find({ paymentStatus: 'completed' });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);

    // Get user count
    const totalUsers = await User.countDocuments();

    return NextResponse.json({
      success: true,
      stats: {
        totalAccounts,
        availableAccounts,
        soldAccounts,
        totalOrders,
        totalRevenue,
        totalUsers,
        stockByType,
      }
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching stats' },
      { status: 500 }
    );
  }
}
