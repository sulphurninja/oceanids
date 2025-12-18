import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import { getUserFromRequest } from '@/lib/auth';

// DELETE account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    // if (!user || !user.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, message: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }

    await connectDB();

    const { id } = await params;

    const account = await Account.findById(id);
    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    if (account.status !== 'available') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete sold/reserved accounts' },
        { status: 400 }
      );
    }

    await Account.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Account deleted'
    });
  } catch (error: any) {
    console.error('Admin account delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting account' },
      { status: 500 }
    );
  }
}

