import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';

export async function GET() {
  try {
    await connectDB();

    // Get count of available accounts by type
    const stock = await Account.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$accountType', count: { $sum: 1 } } }
    ]);

    const stockMap: Record<string, number> = {};
    stock.forEach(item => {
      stockMap[item._id] = item.count;
    });

    return NextResponse.json({
      success: true,
      stock: stockMap
    });
  } catch (error: any) {
    console.error('Stock fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching stock' },
      { status: 500 }
    );
  }
}

