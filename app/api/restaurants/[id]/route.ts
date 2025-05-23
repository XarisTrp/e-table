import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// GET: get restaurant details by ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id: restaurantId } = await context.params;
  try {
    const [rows]: any = await pool.execute(`SELECT id, name, cuisine, description, image, rating,
                                                total_seats AS totalSeats, location, address, city,
                                                opening_time AS openingTime, closing_time AS closingTime,
                                                price_per_seat
                                           FROM restaurants
                                           WHERE id = ?`, [restaurantId]);
    const restaurants = rows as any[];
    if (restaurants.length === 0) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }
    return NextResponse.json(restaurants[0]);
  } catch (error: any) {
    console.error('Get restaurant error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT: update a restaurant by ID (owner only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const restaurantId = params.id;
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
    return NextResponse.json({ message: 'Forbidden: only owners can update restaurants' }, { status: 403 });
  }
  // Verify the current user owns this restaurant
  try {
    const [resRows]: any = await pool.execute('SELECT owner_id FROM restaurants WHERE id = ?', [restaurantId]);
    if ((resRows as any[]).length === 0) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }
    const ownerId = (resRows as any[])[0].owner_id;
    if (ownerId !== payload.userId) {
      return NextResponse.json({ message: 'Forbidden: you do not own this restaurant' }, { status: 403 });
    }
  } catch (err: any) {
    console.error('Verify owner error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
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
    await pool.execute(
      'UPDATE restaurants SET name=?, cuisine=?, description=?, image=?, total_seats=?, location=?, address=?, city=?, opening_time=?, closing_time=?, price_per_seat=? WHERE id=?',
      [name, cuisine, description, image, totalSeatsNum, location, address, city, openingTime, closingTime, pricePerSeatNum, restaurantId]
    );
    // Return updated restaurant
    const [rows]: any = await pool.execute(`SELECT id, name, cuisine, description, image, rating,
                                                 total_seats AS totalSeats, location, address, city,
                                                 opening_time AS openingTime, closing_time AS closingTime,
                                                 price_per_seat
                                          FROM restaurants
                                          WHERE id = ?`, [restaurantId]);
    return NextResponse.json((rows as any[])[0] || {});
  } catch (error: any) {
    console.error('Update restaurant error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: delete a restaurant by ID (owner only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const restaurantId = params.id;
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
    return NextResponse.json({ message: 'Forbidden: only owners can delete restaurants' }, { status: 403 });
  }
  // Verify ownership first
  try {
    const [resRows]: any = await pool.execute('SELECT owner_id FROM restaurants WHERE id = ?', [restaurantId]);
    if ((resRows as any[]).length === 0) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }
    const ownerId = (resRows as any[])[0].owner_id;
    if (ownerId !== payload.userId) {
      return NextResponse.json({ message: 'Forbidden: you do not own this restaurant' }, { status: 403 });
    }
    // Attempt deletion
    await pool.execute('DELETE FROM restaurants WHERE id = ?', [restaurantId]);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    // Check for foreign key constraint error
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      return NextResponse.json({ message: 'Cannot delete restaurant with existing reservations' }, { status: 400 });
    }
    console.error('Delete restaurant error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
