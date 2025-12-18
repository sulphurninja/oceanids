import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/userModel';
import Order from '@/models/orderModel';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);


    await connectDB();

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Get order count for each user
    const usersWithOrders = await Promise.all(
      users.map(async (u: any) => {
        const orderCount = await Order.countDocuments({ user: u._id });
        return {
          ...u,
          orderCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithOrders
    });
  } catch (error: any) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching users' },
      { status: 500 }
    );
  }
}

