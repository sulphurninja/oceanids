import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/orderModel';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);


    await connectDB();

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('provider', 'name slug')
      .populate('accounts', 'username password mobileNumber email emailPassword')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders
    });
  } catch (error: any) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching orders' },
      { status: 500 }
    );
  }
}
