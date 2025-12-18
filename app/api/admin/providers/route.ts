import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Provider from '@/models/providerModel';
import User from '@/models/userModel';

// GET all providers (admin)
export async function GET(req: NextRequest) {
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

    const providers = await Provider.find().sort({ order: 1 }).lean();
    
    // Transform to ensure price field is always present
    const providersWithDefaults = providers.map((p: any) => ({
      _id: p._id,
      slug: p.slug,
      name: p.name,
      description: p.description || '',
      price: p.price || 400,
      icon: p.icon || 'Package',
      color: p.color || 'primary',
      features: p.features || [],
      isActive: p.isActive !== false,
      order: p.order || 0,
    }));
    
    return NextResponse.json({ success: true, providers: providersWithDefaults });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST create new provider
export async function POST(req: NextRequest) {
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
    const { slug, name, description, price, icon, color, features, isActive } = body;

    if (!slug || !name || !price) {
      return NextResponse.json({ 
        success: false, 
        message: 'Slug, name, and price are required' 
      }, { status: 400 });
    }

    // Check if slug already exists
    const existingProvider = await Provider.findOne({ slug: slug.toLowerCase() });
    if (existingProvider) {
      return NextResponse.json({ 
        success: false, 
        message: 'Provider with this slug already exists' 
      }, { status: 400 });
    }

    const provider = await Provider.create({
      slug: slug.toLowerCase(),
      name,
      description: description || '',
      price,
      icon: icon || 'Package',
      color: color || 'primary',
      features: features || [],
      isActive: isActive !== false,
    });

    return NextResponse.json({ success: true, provider });
  } catch (error) {
    console.error('Error creating provider:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

