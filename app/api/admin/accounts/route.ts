import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/accountModel';
import Provider from '@/models/providerModel';
import { getUserFromRequest } from '@/lib/auth';

// GET all accounts
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    // if (!user || !user.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, message: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }

    await connectDB();

    const accounts = await Account.find()
      .populate('soldTo', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Get all providers to map slugs to names
    const providers = await Provider.find().lean();
    const providerMap = new Map(providers.map((p: any) => [p.slug, p.name]));

    // Transform to include provider name for easy display
    const transformedAccounts = accounts.map((acc: any) => ({
      ...acc,
      providerName: providerMap.get(acc.provider) || acc.provider || 'Unknown',
    }));

    return NextResponse.json({
      success: true,
      accounts: transformedAccounts
    });
  } catch (error: any) {
    console.error('Admin accounts fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching accounts' },
      { status: 500 }
    );
  }
}

// POST - Add new accounts
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    // if (!user || !user.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, message: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }

    await connectDB();

    const { accounts } = await request.json();

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Accounts array required' },
        { status: 400 }
      );
    }

    // Get provider slug from first account
    const providerSlug = accounts[0].provider || 'irctc';
    
    // Check if provider exists, create default IRCTC if not
    let provider = await Provider.findOne({ slug: providerSlug });
    
    if (!provider) {
      provider = await Provider.create({
        slug: 'irctc',
        name: 'IRCTC',
        description: 'Verified IRCTC account for train ticket booking',
        price: 400,
        features: ['Verified Account', 'Instant Delivery', 'Full Access'],
        isActive: true,
      });
    }

    // Validate and prepare accounts
    const accountsToCreate = accounts.map(acc => ({
      username: acc.username,
      password: acc.password,
      provider: providerSlug,
      price: acc.price || provider!.price || 400,
      mobileNumber: acc.mobileNumber || '',
      email: acc.email || '',
      notes: acc.notes || '',
      status: 'available',
      addedBy: user?.id || null,
    }));

    // Check for duplicate usernames
    const usernames = accountsToCreate.map(a => a.username);
    const existingAccounts = await Account.find({ username: { $in: usernames } });
    
    if (existingAccounts.length > 0) {
      const existingUsernames = existingAccounts.map((a: any) => a.username);
      return NextResponse.json(
        { 
          success: false, 
          message: `Duplicate usernames found: ${existingUsernames.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Create accounts
    const created = await Account.insertMany(accountsToCreate);

    return NextResponse.json({
      success: true,
      message: `Added ${created.length} accounts`,
      count: created.length
    });
  } catch (error: any) {
    console.error('Admin accounts create error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating accounts' },
      { status: 500 }
    );
  }
}
