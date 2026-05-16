import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sales = await Sale.find({ userId: session.user.id }).populate('productId').sort({ date: -1 });
  return NextResponse.json(sales);
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId, quantity } = await req.json();
  const product = await Product.findOne({ _id: productId, userId: session.user.id });
  
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  if (product.stock < quantity) return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });

  const profitPerItem = product.salePrice - product.costPrice;
  const totalProfit = profitPerItem * quantity;
  const totalRevenue = product.salePrice * quantity;

  const sale = await Sale.create({
    productId,
    quantity,
    profit: totalProfit,
    totalRevenue,
    userId: session.user.id
  });

  // Decrease stock
  product.stock -= quantity;
  await product.save();

  return NextResponse.json(sale);
}
