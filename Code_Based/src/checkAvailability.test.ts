import { describe, it, expect } from 'vitest';
import {
  checkAvailabilityWithDuration,
  labelToMinutes,
  validateTimeLabel,
} from './checkAvailability';
import type { Room, Booking } from './types';

describe('checkAvailability – Practice 07 Improved Suite (T01–T18)', () => {
  // Helper: build a fresh room and booking array per test so no state leaks.
  function freshRoom(): Room {
    return {
      id: 'a101',
      name: 'A-101',
      building: 'Building A',
      capacity: 40,
      blocked: false,
    };
  }

  function freshBookings(): Booking[] {
    return [
      {
        id: 'b1',
        roomId: 'a101',
        title: 'Existing Booking',
        start: 600,
        end: 660,
      },
    ];
  }

  function check(
    start: number,
    end: number,
    currentMinutes: number,
    room: Room,
    bookings: Booking[]
  ) {
    return checkAvailabilityWithDuration({
      start,
      duration: end - start,
      currentMinutes,
      room,
      bookings,
    });
  }

  it('T01 – interval 660→720 available (no overlap, future, ≤120min)', () => {
    const result = check(660, 720, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(true);
  });

  it('T02 – interval 540→570 unavailable (start not after current)', () => {
    const result = check(540, 570, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(false);
  });

  it('T03 – zero-length interval 720→720 unavailable (invalid interval reason)', () => {
    const result = check(720, 720, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(false);
    if (!result.available) {
      expect(result.reasonCode).toBe('INVALID_DURATION');
    }
  });

  it('T04 – interval 750→720 unavailable (start after end)', () => {
    const result = check(750, 720, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(false);
  });

  it('T05 – interval 1380→1441 unavailable (end exceeds 1440)', () => {
    const result = check(1380, 1441, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(false);
  });

  it('T06 – interval 720→840 available (exactly 120min, future, no overlap)', () => {
    const result = check(720, 840, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(true);
  });

  it('T07 – interval 720→841 unavailable (duration limit reason)', () => {
    const result = check(720, 841, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(false);
    if (!result.available) {
      expect(result.reasonCode).toBe('INVALID_DURATION');
    }
  });

  it('T08 – interval 570→600 available (ends when existing booking starts)', () => {
    const result = check(570, 600, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(true);
  });

  it('T09 – interval 630→690 unavailable (overlap reason references existing booking)', () => {
    const result = check(630, 690, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(false);
    if (!result.available) {
      expect(result.reasonCode).toBe('ROOM_OVERLAP');
      expect(result.message).toContain('Existing Booking');
    }
  });

  it('T10 – interval 570→690 unavailable (overlaps existing 600→660 booking)', () => {
    const result = check(570, 690, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(false);
  });

  it('T11 – interval 615→645 unavailable (fully inside existing 600→660 booking)', () => {
    const result = check(615, 645, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(false);
  });

  it('T12 – interval 600→660 unavailable (identical to existing booking)', () => {
    const result = check(600, 660, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(false);
  });

  it('T13 – interval 660→720 unavailable when room is blocked (blocked reason)', () => {
    const room = freshRoom();
    room.blocked = true;
    const result = check(660, 720, 540, room, freshBookings());
    expect(result.available).toBe(false);
    if (!result.available) {
      expect(result.reasonCode).toBe('ROOM_BLOCKED');
    }
  });

  it('T14 – interval 630→690 available when bookings array is empty', () => {
    const result = check(630, 690, 540, freshRoom(), []);
    expect(result.available).toBe(true);
  });

  it('T15 – original bookings array remains unchanged after checks', () => {
    const bookings = freshBookings();
    const snapshot = JSON.parse(JSON.stringify(bookings));
    // Run several availability checks against the same bookings array.
    check(660, 720, 540, freshRoom(), bookings);
    check(500, 600, 540, freshRoom(), bookings);
    check(630, 690, 540, freshRoom(), bookings);
    expect(bookings).toEqual(snapshot);
    expect(bookings.length).toBe(1);
  });

  it('T16 – interval 541→600 available (start just after current 540)', () => {
    const result = check(541, 600, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(true);
  });

  it('T17 – interval 539→570 unavailable (start before current 540)', () => {
    const result = check(539, 570, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(false);
  });

  it('T18 – bookings for a different room do not affect availability of selected room', () => {
    const room = freshRoom(); // a101
    const otherRoomBookings: Booking[] = [
      {
        id: 'other-b1',
        roomId: 'b202',
        title: 'Other Room Booking',
        start: 630,
        end: 690,
      },
    ];
    // 630→690 overlaps the other room's booking times, but belongs to b202, not a101.
    const result = check(630, 690, 540, room, otherRoomBookings);
    expect(result.available).toBe(true);
  });

  it('T19 – 24:00 is valid end time; 22:00→24:00 available (regression for 24:00 parsing bug)', () => {
    expect(labelToMinutes('24:00')).toBe(1440);
    expect(labelToMinutes('24:01')).toBeNull();
    expect(labelToMinutes('24:00')).not.toBeNull();
    const result = check(1320, 1440, 540, freshRoom(), freshBookings());
    expect(result.available).toBe(true);
  });

  it('T20 – validateTimeLabel rejects malformed times (25:00, 12:60, 24:01)', () => {
    expect('error' in validateTimeLabel('25:00', true)).toBe(true);
    expect('error' in validateTimeLabel('12:60', true)).toBe(true);
    expect('error' in validateTimeLabel('24:01', true)).toBe(true);
    expect('error' in validateTimeLabel('ab:cd', true)).toBe(true);
    expect('error' in validateTimeLabel('9:00', true)).toBe(true);
  });

  it('T21 – validateTimeLabel accepts valid times including 24:00 as end only', () => {
    expect(validateTimeLabel('09:00', false)).toEqual({ minutes: 540 });
    expect(validateTimeLabel('14:01', false)).toEqual({ minutes: 841 });
    expect(validateTimeLabel('24:00', true)).toEqual({ minutes: 1440 });
    expect(validateTimeLabel('22:00', true)).toEqual({ minutes: 1320 });
  });

  it('T22 – validateTimeLabel rejects 24:00 as a start time', () => {
    const result = validateTimeLabel('24:00', false);
    expect('error' in result).toBe(true);
  });
});
