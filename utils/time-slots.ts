export function getTimeSlotDisplay(timeSlot: number): string {
  const slotMap: Record<number, string> = {
    0: "8:00 AM - 10:30 AM",
    1: "10:30 AM - 1:00 PM",
    2: "1:00 PM - 3:30 PM",
    3: "3:30 PM - 6:00 PM",
    4: "6:00 PM - 8:30 PM",
    5: "8:30 PM - 11:00 PM",
    6: "11:00 PM - 1:30 AM",
    7: "1:30 AM - 4:00 AM",
    8: "4:00 AM - 6:30 AM",
  }
  return slotMap[timeSlot] || "Unknown time slot"
}
