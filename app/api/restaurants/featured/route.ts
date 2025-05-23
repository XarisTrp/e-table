import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

export async function GET(req: NextRequest) {
  try {
    const [rows]: any = await pool.execute(`SELECT id, name, cuisine, description, image, rating,
                                                total_seats AS totalSeats, location, address, city,
                                                opening_time AS openingTime, closing_time AS closingTime,
                                                price_per_seat
                                           FROM restaurants
                                           ORDER BY rating DESC, name ASC
                                           LIMIT 3`);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Featured restaurants error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
