import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Delete all transactions for this customer
  await Transaction.deleteMany({ customerId: id, userId: session.user.id });
  
  // Delete the customer
  await Customer.deleteOne({ _id: id, userId: session.user.id });

  return NextResponse.json({ message: 'Customer and all records deleted successfully' });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { name, phone } = await req.json();
  const customer = await Customer.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { name, phone },
    { new: true }
  );

  return NextResponse.json(customer);
}
