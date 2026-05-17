import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  await dbConnect();
  const session = ((await getServerSession(authOptions)) as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId');
  if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

  const customers = await Customer.find({ userId: session.user.id, businessId }).sort({ updatedAt: -1 });
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  await dbConnect();
  const session = ((await getServerSession(authOptions)) as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, phone, businessId } = await req.json();
  if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

  const customer = await Customer.create({
    name,
    phone,
    userId: session.user.id,
    businessId,
    balance: 0
  });
  return NextResponse.json(customer);
}

