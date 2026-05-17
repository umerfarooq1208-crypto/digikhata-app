import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import Product from '@/models/Product';
import Sale from '@/models/Sale';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  await dbConnect();
  const session = (await getServerSession(authOptions)) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let businesses = await Business.find({ userId: session.user.id });

  if (businesses.length === 0) {
    // Create default business
    const defaultBusiness = await Business.create({
      name: 'My Business',
      currency: 'Rs',
      userId: session.user.id
    });
    businesses = [defaultBusiness];

    // Migrate old data
    await Customer.updateMany({ userId: session.user.id, businessId: { $exists: false } }, { businessId: defaultBusiness._id });
    await Transaction.updateMany({ userId: session.user.id, businessId: { $exists: false } }, { businessId: defaultBusiness._id });
    await Product.updateMany({ userId: session.user.id, businessId: { $exists: false } }, { businessId: defaultBusiness._id });
    await Sale.updateMany({ userId: session.user.id, businessId: { $exists: false } }, { businessId: defaultBusiness._id });
  }

  return NextResponse.json(businesses);
}

export async function POST(req: Request) {
  await dbConnect();
  const session = (await getServerSession(authOptions)) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, currency } = await req.json();
  const business = await Business.create({
    name,
    currency: currency || 'Rs',
    userId: session.user.id
  });

  return NextResponse.json(business);
}
