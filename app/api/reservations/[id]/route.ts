import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// DELETE: cancel a reservation by ID
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id: reservationId } = await context.params;
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
  try {
    const [rows]: any = await pool.execute(
      `SELECT r.user_id, r.status, r.restaurant_id, rest.owner_id
         FROM reservations r
         JOIN restaurants rest ON r.restaurant_id = rest.id
         WHERE r.id = ?`,
      [reservationId]
    );
    const records = rows as any[];
    if (records.length === 0) {
      return NextResponse.json({ message: 'Reservation not found' }, { status: 404 });
    }
    const resv = records[0];
    // If already cancelled, return error
    if (resv.status === 'CANCELLED') {
      return NextResponse.json({ message: 'Reservation is already cancelled' }, { status: 400 });
    }
    const isOwner = payload.role === 'OWNER' && resv.owner_id === payload.userId;
    const isCustomer = payload.role === 'CUSTOMER' && resv.user_id === payload.userId;
    if (!isOwner && !isCustomer) {
      return NextResponse.json({ message: 'Forbidden: you cannot cancel this reservation' }, { status: 403 });
    }
    // Mark reservation as cancelled
    await pool.execute('UPDATE reservations SET status = "CANCELLED" WHERE id = ?', [reservationId]);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Cancel reservation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
