import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  await dbConnect();
  const session = ((await getServerSession(authOptions)) as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });

  const transactions = await Transaction.find({ 
    customerId, 
    userId: session.user.id 
  }).sort({ date: -1 });

  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  await dbConnect();
  const session = ((await getServerSession(authOptions)) as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { customerId, amount, description, type } = await req.json();

  const transaction = await Transaction.create({
    customerId,
    userId: session.user.id,
    amount,
    description,
    type,
    date: new Date()
  });

  // Update customer balance
  // If type is GAVE, amount is added to balance (You will get more)
  // If type is GOT, amount is subtracted from balance (You will get less / You will give)
  const balanceChange = type === 'GAVE' ? amount : -amount;
  await Customer.findByIdAndUpdate(customerId, {
    $inc: { balance: balanceChange }
  });

  return NextResponse.json(transaction);
}

