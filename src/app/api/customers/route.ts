import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const customers = await Customer.find({ userId: session.user.id }).sort({ updatedAt: -1 });
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, phone } = await req.json();
  const customer = await Customer.create({
    name,
    phone,
    userId: session.user.id,
    balance: 0
  });
  return NextResponse.json(customer);
}
