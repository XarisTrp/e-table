import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// GET: list current user's reservations (customer dashboard)
export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  let payload: any;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = payload.userId;
  try {
    const [rows]: any = await pool.execute(
      `SELECT r.id, r.restaurant_id AS restaurantId, rest.name AS restaurantName,
              DATE_FORMAT(r.date, '%Y-%m-%d') AS date,
              r.time_slot, r.party_size AS partySize,
              r.total_price, r.status,
              r.contact_info AS contactInfo, r.customer_name AS customerName
         FROM reservations r
         JOIN restaurants rest ON r.restaurant_id = rest.id
         WHERE r.user_id = ? AND r.status = 'ACTIVE' AND r.date >= CURDATE()
         ORDER BY r.date ASC, r.time_slot ASC`,
      [userId]
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Get my reservations error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
