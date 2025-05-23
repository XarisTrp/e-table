import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(req: NextRequest) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    await connection.end();

    return NextResponse.json({ message: 'Database connected!', result: rows });
  } catch (error: any) {
    console.error('DB test error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}