import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/userModel';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = getUserFromRequest(request);

    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(tokenPayload.id).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching user' },
      { status: 500 }
    );
  }
}

