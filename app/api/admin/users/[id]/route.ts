import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/userModel';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getUserFromRequest(request);
    // if (!currentUser || !currentUser.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, message: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }

    await connectDB();

    const { id } = await params;
    const { isAdmin } = await request.json();

    // Prevent removing own admin status
    if (id === currentUser.id && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Cannot remove your own admin status' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isAdmin },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isAdmin ? 'User is now an admin' : 'Admin status removed',
      user
    });
  } catch (error: any) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating user' },
      { status: 500 }
    );
  }
}

