import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import Product from '@/models/Product';
import Sale from '@/models/Sale';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = (await getServerSession(authOptions)) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { name, currency } = await req.json();

  const business = await Business.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { name, currency },
    { new: true }
  );

  return NextResponse.json(business);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = (await getServerSession(authOptions)) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Prevent deleting if it's the only business
  const count = await Business.countDocuments({ userId: session.user.id });
  if (count <= 1) {
    return NextResponse.json({ error: 'Cannot delete your only business' }, { status: 400 });
  }

  // Delete all linked data
  await Customer.deleteMany({ businessId: id, userId: session.user.id });
  await Transaction.deleteMany({ businessId: id, userId: session.user.id });
  await Product.deleteMany({ businessId: id, userId: session.user.id });
  await Sale.deleteMany({ businessId: id, userId: session.user.id });

  await Business.deleteOne({ _id: id, userId: session.user.id });

  return NextResponse.json({ message: 'Business deleted successfully' });
}
