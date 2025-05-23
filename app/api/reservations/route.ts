import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// POST: create a new reservation (customers only)
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
  if (payload.role !== 'CUSTOMER') {
    return NextResponse.json({ message: 'Only customers can make reservations' }, { status: 403 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }
  const { restaurantId, date, time_slot, partySize } = body;
  if (!restaurantId || !date || time_slot === undefined || !partySize) {
    return NextResponse.json({ message: 'Missing reservation details' }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
  }
  const partySizeNum = parseInt(partySize);
  if (isNaN(partySizeNum) || partySizeNum <= 0) {
    return NextResponse.json({ message: 'Invalid party size' }, { status: 400 });
  }
  const timeSlotNum = parseInt(time_slot);
  if (isNaN(timeSlotNum) || timeSlotNum < 0 || timeSlotNum > 23) {
    return NextResponse.json({ message: 'Invalid time slot' }, { status: 400 });
  }
  try {
    // Check restaurant and get info
    const [restRows]: any = await pool.execute('SELECT name, total_seats, price_per_seat FROM restaurants WHERE id = ?', [restaurantId]);
    if ((restRows as any[]).length === 0) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }
    const restaurant = (restRows as any[])[0];
    // Check availability: get reserved seats for that date & slot
    const [resRows]: any = await pool.execute(
      'SELECT SUM(party_size) AS reservedSeats FROM reservations WHERE restaurant_id = ? AND date = ? AND time_slot = ? AND status = "ACTIVE"',
      [restaurantId, date, timeSlotNum]
    );
    const reservedSeats = resRows[0].reservedSeats ? parseInt(resRows[0].reservedSeats) : 0;
    if (reservedSeats + partySizeNum > restaurant.total_seats) {
      return NextResponse.json({ message: 'Not enough available seats for the selected time' }, { status: 400 });
    }
    // Calculate total price
    const totalPrice = parseFloat(restaurant.price_per_seat) * partySizeNum;
    // Get user info for contact and name
    const [userRows]: any = await pool.execute('SELECT name, email FROM users WHERE id = ?', [payload.userId]);
    const user = (userRows as any[])[0];
    const customerName = user.name;
    const contactInfo = user.email;
    // Insert reservation
    const [result]: any = await pool.execute(
      'INSERT INTO reservations (restaurant_id, user_id, date, time_slot, party_size, total_price, status, contact_info, customer_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [restaurantId, payload.userId, date, timeSlotNum, partySizeNum, totalPrice, 'ACTIVE', contactInfo, customerName]
    );
    const insertId = result.insertId;
    // Return reservation details
    const newReservation = {
      id: insertId,
      restaurantId: restaurantId,
      restaurantName: restaurant.name,
      date: date,
      time_slot: timeSlotNum,
      partySize: partySizeNum,
      total_price: totalPrice,
      status: 'ACTIVE',
      contactInfo: contactInfo,
      customerName: customerName
    };
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error: any) {
    console.error('Create reservation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
