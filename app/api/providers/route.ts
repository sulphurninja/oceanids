import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Provider from '@/models/providerModel';
import Account from '@/models/accountModel';

// GET active providers (public)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const providers = await Provider.find({ isActive: true }).sort({ order: 1 }).lean();
    
    // Add stock count for each provider
    const providersWithStock = await Promise.all(
      providers.map(async (provider: any) => {
        const inStock = await Account.countDocuments({ 
          provider: provider.slug, 
          status: 'available' 
        });
        
        return {
          _id: provider._id,
          slug: provider.slug,
          name: provider.name,
          description: provider.description,
          price: provider.price,
          features: provider.features,
          icon: provider.icon,
          color: provider.color,
          inStock,
        };
      })
    );

    return NextResponse.json({ success: true, providers: providersWithStock });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}


