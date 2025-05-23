import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

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
  if (payload.role !== 'OWNER') {
    return NextResponse.json({ message: 'Forbidden: only owners can access their restaurants' }, { status: 403 });
  }
  const ownerId = payload.userId;
  try {
    const [rows]: any = await pool.execute(`SELECT r.id, r.name, r.cuisine, r.description, r.image, r.rating,
                                                  r.total_seats AS totalSeats, r.location, r.address, r.city,
                                                  r.opening_time AS openingTime, r.closing_time AS closingTime,
                                                  r.price_per_seat,
                                                  (SELECT COUNT(*) FROM reservations res 
                                                    WHERE res.restaurant_id = r.id 
                                                      AND res.status = 'ACTIVE' 
                                                      AND res.date >= CURDATE()) AS reservationCount
                                           FROM restaurants r
                                           WHERE r.owner_id = ?`, [ownerId]);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Owner restaurants error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
