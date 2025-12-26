import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);

    const { id } = await params;

    await connectDB();

    const account = await Account.findById(id);

    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    if (account.status !== 'reserved') {
      return NextResponse.json(
        { success: false, message: `Cannot unreserve account with status: ${account.status}` },
        { status: 400 }
      );
    }

    // Release the account back to available
    account.status = 'available';
    account.orderId = null;
    await account.save();

    console.log(`[ADMIN] Admin unreserved account: ${account.username}`);

    return NextResponse.json({
      success: true,
      message: 'Account unreserved and released back to available',
      account,
    });
  } catch (error: any) {
    console.error('Admin unreserve account error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error unreserving account' },
      { status: 500 }
    );
  }
}

