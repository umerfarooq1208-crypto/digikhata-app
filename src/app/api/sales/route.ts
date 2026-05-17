import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  await dbConnect();
  const session = ((await getServerSession(authOptions)) as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId');
  if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

  const sales = await Sale.find({ userId: session.user.id, businessId }).populate('productId').sort({ date: -1 });
  return NextResponse.json(sales);
}

export async function POST(req: Request) {
  await dbConnect();
  const session = ((await getServerSession(authOptions)) as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId, businessId, quantity, date } = await req.json();
  if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

  const product = await Product.findOne({ _id: productId, userId: session.user.id, businessId });
  
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  if (product.stock < quantity) return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });

  const profitPerItem = product.salePrice - product.costPrice;
  const totalProfit = profitPerItem * quantity;
  const totalRevenue = product.salePrice * quantity;

  const sale = await Sale.create({
    productId,
    businessId,
    quantity,
    profit: totalProfit,
    totalRevenue,
    userId: session.user.id,
    date: date ? new Date(date) : new Date()
  });

  // Decrease stock
  product.stock -= quantity;
  await product.save();

  return NextResponse.json(sale);
}

