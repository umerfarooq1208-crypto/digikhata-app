import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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

  const products = await Product.find({ userId: session.user.id, businessId }).sort({ updatedAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  await dbConnect();
  const session = ((await getServerSession(authOptions)) as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, costPrice, salePrice, stock, businessId } = await req.json();
  if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

  const product = await Product.create({
    name,
    costPrice,
    salePrice,
    stock,
    userId: session.user.id,
    businessId
  });
  return NextResponse.json(product);
}

