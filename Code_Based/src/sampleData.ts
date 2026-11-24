import type { Room, Booking } from './types';

export const ROOMS: Room[] = [
  { id: 'a101', name: 'A-101', building: 'Building A', capacity: 40, blocked: false },
];

export const BOOKINGS: Booking[] = [
  { id: 'b1', roomId: 'a101', title: 'Existing Booking', start: 600, end: 660 }, // 10:00–11:00
];
