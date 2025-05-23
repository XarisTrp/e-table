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
  const { name, email, password, role } = body;
  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
  }
  const userRole = (role === 'OWNER' || role === 'CUSTOMER') ? role : 'CUSTOMER';
  if (password.length < 6) {
    return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
  }
  try {
    // Check if email already exists
    const [existing]: any = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ message: 'Email already in use' }, { status: 409 });
    }
    // Hash password and insert new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result]: any = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );
    const insertId = result.insertId;
    // Create JWT token for new user
    const token = jwt.sign({ userId: insertId, role: userRole }, JWT_SECRET);
    // Respond with user data and set cookie
    const response = NextResponse.json({ id: insertId, name, email, role: userRole });
    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    });
    return response;
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
