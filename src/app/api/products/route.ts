import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  await dbConnect();
  const session = ((await getServerSession(authOptions)) as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const products = await Product.find({ userId: session.user.id }).sort({ updatedAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  await dbConnect();
  const session = ((await getServerSession(authOptions)) as any) as any;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, costPrice, salePrice, stock } = await req.json();
  const product = await Product.create({
    name,
    costPrice,
    salePrice,
    stock,
    userId: session.user.id
  });
  return NextResponse.json(product);
}

