import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { amount, description } = await req.json();
  
  const oldTran = await Transaction.findOne({ _id: id, userId: session.user.id });
  if (!oldTran) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  const amountDiff = amount - oldTran.amount;
  const balanceChange = oldTran.type === 'GAVE' ? amountDiff : -amountDiff;

  const newTran = await Transaction.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { amount, description },
    { new: true }
  );

  // Update customer balance
  await Customer.findByIdAndUpdate(oldTran.customerId, {
    $inc: { balance: balanceChange }
  });

  return NextResponse.json(newTran);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const tran = await Transaction.findOneAndDelete({ _id: id, userId: session.user.id });
  if (!tran) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  // Revert balance
  const balanceRevert = tran.type === 'GAVE' ? -tran.amount : tran.amount;
  await Customer.findByIdAndUpdate(tran.customerId, {
    $inc: { balance: balanceRevert }
  });

  return NextResponse.json({ message: 'Transaction deleted' });
}
