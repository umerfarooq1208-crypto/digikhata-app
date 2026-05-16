import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const user = await User.findOne({ email }).select('securityQuestion');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ securityQuestion: user.securityQuestion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
