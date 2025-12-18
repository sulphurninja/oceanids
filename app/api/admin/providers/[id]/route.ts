import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Provider from '@/models/providerModel';
import User from '@/models/userModel';

// PUT update provider
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);
    // if (!user?.isAdmin) {
    //   return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    // }

    const body = await req.json();
    const { name, description, price, icon, color, features, isActive, order } = body;

    const provider = await Provider.findByIdAndUpdate(
      params.id,
      { 
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(features && { features }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      },
      { new: true }
    );

    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, provider });
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE provider
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);
    // if (!user?.isAdmin) {
    //   return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    // }

    const provider = await Provider.findByIdAndDelete(params.id);

    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Provider deleted' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

