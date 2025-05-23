import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id: restaurantId } = await context.params;
  const date = req.nextUrl.searchParams.get('date');
  if (!date) {
    return NextResponse.json({ message: 'Missing date parameter' }, { status: 400 });
  }
  // Expect date in YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
  }
  try {
    // Get restaurant capacity and hours
    const [rows]: any = await pool.execute('SELECT opening_time, closing_time, total_seats FROM restaurants WHERE id = ?', [restaurantId]);
    if ((rows as any[]).length === 0) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }
    const { opening_time, closing_time, total_seats } = (rows as any[])[0];
    const [openHour, openMin] = (opening_time as string).split(':').map(Number);
    const [closeHour, closeMin] = (closing_time as string).split(':').map(Number);
    // Generate time slots (1-hour interval from opening to closing)
    const slotStartTimes: number[] = [];
    let hour = openHour;
    let minute = openMin;
    const closingTotalMins = closeHour * 60 + closeMin;
    while (true) {
      const startMins = hour * 60 + minute;
      const endMins = startMins + 60;
      if (endMins > closingTotalMins) break;
      slotStartTimes.push(startMins);
      // move to next slot (1 hour later)
      hour = Math.floor(endMins / 60);
      minute = endMins % 60;
      if (startMins >= closingTotalMins) break;
    }
    // Get sum of reserved seats for each slot on that date
    const [resCountRows]: any = await pool.execute(
      'SELECT time_slot, SUM(party_size) AS reservedSeats FROM reservations WHERE restaurant_id = ? AND date = ? AND status = "ACTIVE" GROUP BY time_slot',
      [restaurantId, date]
    );
    const reservedMap: Record<number, number> = {};
    for (const row of resCountRows as any[]) {
      reservedMap[parseInt(row.time_slot)] = parseInt(row.reservedSeats);
    }
    // Build timeslot availability response
    const availableSlots: { slot: number, availableSeats: number, displayTime: string }[] = [];
    for (const startMins of slotStartTimes) {
      const slotHour = Math.floor(startMins / 60);
      const slotMin = startMins % 60;
      const reservedSeats = reservedMap[slotHour] || 0;
      const availableSeats = Math.max((total_seats as number) - reservedSeats, 0);
      // Format time for display (12-hour format)
      let displayHour = slotHour % 12;
      if (displayHour === 0) displayHour = 12;
      const amPm = slotHour < 12 ? 'AM' : 'PM';
      const displayMinute = slotMin.toString().padStart(2, '0');
      const displayTime = `${displayHour}:${displayMinute} ${amPm}`;
      availableSlots.push({ slot: slotHour, availableSeats, displayTime });
    }
    return NextResponse.json(availableSlots);
  } catch (error: any) {
    console.error('Availability error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
