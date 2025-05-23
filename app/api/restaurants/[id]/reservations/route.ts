import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// GET: list reservations for a specific restaurant (owner only)
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id: restaurantId } = await context.params;
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
    return NextResponse.json({ message: 'Forbidden: only owners can view reservations' }, { status: 403 });
  }
  // Ensure the restaurant belongs to this owner
  try {
    const [resRows]: any = await pool.execute('SELECT owner_id FROM restaurants WHERE id = ?', [restaurantId]);
    if ((resRows as any[]).length === 0) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }
    const ownerId = (resRows as any[])[0].owner_id;
    if (ownerId !== payload.userId) {
      return NextResponse.json({ message: 'Forbidden: you do not own this restaurant' }, { status: 403 });
    }
    // Fetch reservations for this restaurant (upcoming, active)
    const [rows]: any = await pool.execute(
      `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') AS date, time_slot, party_size AS partySize,
              total_price, status, contact_info AS contactInfo, customer_name AS customerName
         FROM reservations
         WHERE restaurant_id = ? AND status = 'ACTIVE' AND date >= CURDATE()
         ORDER BY date ASC, time_slot ASC`,
      [restaurantId]
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Get restaurant reservations error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
