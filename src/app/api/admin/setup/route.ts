import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  await dbConnect();
  
  // Promote the specific user to admin
  const user = await User.findOneAndUpdate(
    { email: 'umerfarooq1208@gmail.com' },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    return NextResponse.json({ error: 'User not found. Please register first with umerfarooq1208@gmail.com' }, { status: 404 });
  }

  return NextResponse.json({ message: 'User promoted to ADMIN successfully!', user: user.name });
}
