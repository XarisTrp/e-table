import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = payload.userId;
  try {
    const [rows]: any = await pool.execute('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
    const users = rows as { id: number, name: string, email: string, role: string }[];
    if (users.length === 0) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const user = users[0];
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Me error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
