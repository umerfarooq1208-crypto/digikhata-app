import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import Product from '@/models/Product';
import Sale from '@/models/Sale';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await User.find({}).select('-password');
  
  // Enhance users with stats
  const usersWithStats = await Promise.all(users.map(async (user) => {
    const customerCount = await Customer.countDocuments({ userId: user._id });
    const productCount = await Product.countDocuments({ userId: user._id });
    return {
      ...user.toObject(),
      customerCount,
      productCount
    };
  }));

  return NextResponse.json(usersWithStats);
}

export async function DELETE(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await req.json();

  // Clean up all user data
  await Promise.all([
    User.findByIdAndDelete(userId),
    Customer.deleteMany({ userId }),
    Transaction.deleteMany({ userId }),
    Product.deleteMany({ userId }),
    Sale.deleteMany({ userId })
  ]);

  return NextResponse.json({ message: 'User and all associated data deleted' });
}
