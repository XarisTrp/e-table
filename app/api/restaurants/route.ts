import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// GET: list all restaurants (with optional search and cuisine filters)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url, 'http://localhost:3000');
  const search = searchParams.get('search') || '';
  const cuisine = searchParams.get('cuisine') || '';
  try {
    let query = `SELECT id, name, cuisine, description, image, rating,
                    total_seats AS totalSeats, location, address, city,
                    opening_time AS openingTime, closing_time AS closingTime,
                    price_per_seat
                 FROM restaurants`;
    const params: any[] = [];
    const conditions: string[] = [];
    if (search) {
      conditions.push('(name LIKE ? OR city LIKE ? OR location LIKE ?)');
      const likeTerm = '%' + search + '%';
      params.push(likeTerm, likeTerm, likeTerm);
    }
    if (cuisine && cuisine !== 'All') {
      conditions.push('cuisine = ?');
      params.push(cuisine);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    // Optionally, sort results (e.g., by name)
    query += ' ORDER BY name';
    const [rows]: any = await pool.execute(query, params);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('List restaurants error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: create a new restaurant (owner only)
export async function POST(req: NextRequest) {
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
    return NextResponse.json({ message: 'Forbidden: only owners can create restaurants' }, { status: 403 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }
  const {
    name, cuisine, description, image,
    location, address, city,
    openingTime, closingTime, totalSeats, price_per_seat
  } = body;
  // Basic validation
  if (!name || !cuisine || !description || !image || !location || !address || !city || !openingTime || !closingTime || !totalSeats || !price_per_seat) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }
  const totalSeatsNum = parseInt(totalSeats);
  const pricePerSeatNum = parseFloat(price_per_seat);
  if (isNaN(totalSeatsNum) || totalSeatsNum <= 0) {
    return NextResponse.json({ message: 'Total seats must be a positive number' }, { status: 400 });
  }
  if (isNaN(pricePerSeatNum) || pricePerSeatNum < 0) {
    return NextResponse.json({ message: 'Price per seat must be a non-negative number' }, { status: 400 });
  }
  try {
    const [result]: any = await pool.execute(
      'INSERT INTO restaurants (name, cuisine, description, image, rating, total_seats, location, address, city, opening_time, closing_time, price_per_seat, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, cuisine, description, image, 0, totalSeatsNum, location, address, city, openingTime, closingTime, pricePerSeatNum, payload.userId]
    );
    const insertId = result.insertId;
    // Return the newly created restaurant
    const [rows]: any = await pool.execute(`SELECT id, name, cuisine, description, image, rating,
                                                 total_seats AS totalSeats, location, address, city,
                                                 opening_time AS openingTime, closing_time AS closingTime,
                                                 price_per_seat
                                          FROM restaurants WHERE id = ?`, [insertId]);
    const newRestaurant = (rows as any[])[0];
    return NextResponse.json(newRestaurant, { status: 201 });
  } catch (error: any) {
    console.error('Create restaurant error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
