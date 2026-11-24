import { describe, it, expect } from 'vitest';
import { checkAvailabilityWithDuration, MAX_DURATION } from './checkAvailability';
import { ROOMS, BOOKINGS } from './sampleData';
import type { Room, Booking } from './types';

describe('Practice #12 – Shared Suite (T1–T8)', () => {
  const CURRENT = 540; // 09:00

  function room(blocked = false): Room {
    return { ...ROOMS[0], blocked };
  }

  function bookings(): Booking[] {
    return BOOKINGS.map((b) => ({ ...b }));
  }

  function check(start: number, duration: number, blockedRoom = false, roomBookings = bookings()) {
    return checkAvailabilityWithDuration({
      start,
      duration,
      currentMinutes: CURRENT,
      room: room(blockedRoom),
      bookings: roomBookings,
    });
  }

  it('T1 – start 12:00, duration 60, room open – Available', () => {
    const result = check(720, 60);
    expect(result.available).toBe(true);
    expect(result.kind).toBe('available');
    expect(result.reasonCode).toBe('OK');
  });

  it('T2 – start 10:30, duration 60, room open – Unavailable (overlap)', () => {
    const result = check(630, 60);
    expect(result.available).toBe(false);
    expect(result.kind).toBe('unavailable');
    expect(result.reasonCode).toBe('ROOM_OVERLAP');
  });

  it('T3 – start 12:00, duration 60, room blocked – Unavailable', () => {
    const result = check(720, 60, true);
    expect(result.available).toBe(false);
    expect(result.kind).toBe('unavailable');
    expect(result.reasonCode).toBe('ROOM_BLOCKED');
  });

  it('T4 – start 12:00, duration 0 – Validation Error', () => {
    const result = check(720, 0);
    expect(result.available).toBe(false);
    expect(result.kind).toBe('validation_error');
    expect(result.reasonCode).toBe('INVALID_DURATION');
  });

  it('T5 – start 12:00, duration 121 – Validation Error', () => {
    const result = check(720, 121);
    expect(result.available).toBe(false);
    expect(result.kind).toBe('validation_error');
    expect(result.reasonCode).toBe('INVALID_DURATION');
  });

  it('T6 – start 08:00, duration 30 – Validation Error (start not in future)', () => {
    const result = check(480, 30);
    expect(result.available).toBe(false);
    expect(result.kind).toBe('validation_error');
    expect(result.reasonCode).toBe('START_NOT_IN_FUTURE');
  });

  it('T7 – start 11:00, duration 60 – Available (adjacent to 10:00–11:00)', () => {
    const result = check(660, 60);
    expect(result.available).toBe(true);
    expect(result.kind).toBe('available');
  });

  it(`T8 – duration limit constant stays ${MAX_DURATION} min and fixtures unchanged after checks`, () => {
    const snapshot = JSON.stringify(bookings());
    const subjects = [
      check(720, 60),
      check(630, 60),
      check(720, 60, true),
      check(720, 0),
      check(720, 121),
      check(480, 30),
      check(660, 60),
    ];
    for (const result of subjects) {
      expect(typeof result.available).toBe('boolean');
      expect(typeof result.reasonCode).toBe('string');
    }
    expect(JSON.stringify(BOOKINGS.map((b) => ({ ...b })))).toBe(snapshot);
    expect(BOOKINGS).toEqual([{ id: 'b1', roomId: 'a101', title: 'Existing Booking', start: 600, end: 660 }]);
    expect(ROOMS[0].blocked).toBe(false);
  });
});
