import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }
  // Find user by email
  try {
    const [rows]: any = await pool.execute('SELECT id, name, email, role, password_hash FROM users WHERE email = ?', [email]);
    const users = rows as { id: number, name: string, email: string, role: string, password_hash: string }[];
    if (users.length === 0) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
    const user = users[0];
    // Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
    // Create JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    // Set token cookie
    const response = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    });
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
