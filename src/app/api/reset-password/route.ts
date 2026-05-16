import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, securityAnswer, newPassword } = await req.json();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.securityAnswer !== securityAnswer.toLowerCase().trim()) {
      return NextResponse.json({ error: 'Incorrect security answer' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
