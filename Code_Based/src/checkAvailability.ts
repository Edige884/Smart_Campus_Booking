import type { Room, Booking, AvailabilityResult, ReasonCode } from './types';

const MINUTES_PER_DAY = 1440;
export const MAX_DURATION = 120;

const FAIL = (
  reasonCode: ReasonCode,
  message: string,
  kind: 'unavailable' | 'validation_error' = 'validation_error'
): AvailabilityResult => ({ available: false, kind, reasonCode, message });

export const AVAILABLE: AvailabilityResult = {
  available: true,
  kind: 'available',
  reasonCode: 'OK',
  message: null,
};

export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function labelToMinutes(label: string): number | null {
  const match = label.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h === 24 && m === 0) return 1440;
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function validateTimeLabel(
  label: string,
  isEnd: boolean
): { minutes: number } | { error: string } {
  const min = labelToMinutes(label.trim());
  if (min === null) {
    return { error: 'Enter a valid time in HH:MM format (e.g. 09:00).' };
  }
  if (!isEnd && min === 1440) {
    return { error: '24:00 is not a valid start time.' };
  }
  return { minutes: min };
}

export function validateStart(start: number): { minutes: number } | AvailabilityResult {
  if (typeof start !== 'number' || !Number.isFinite(start) || !Number.isInteger(start)) {
    return FAIL('INVALID_START', 'Start must be a whole number of minutes (0–1440).');
  }
  if (start < 0 || start > MINUTES_PER_DAY) {
    return FAIL(
      'INVALID_START',
      'Start must be within the day (00:00–24:00), i.e. 0–1440 minutes.'
    );
  }
  if (start === MINUTES_PER_DAY) {
    return FAIL('INVALID_START', '24:00 (1440) is not a valid start time.');
  }
  return { minutes: start };
}

export function validateDuration(duration: number): { minutes: number } | AvailabilityResult {
  if (typeof duration !== 'number' || !Number.isFinite(duration) || !Number.isInteger(duration)) {
    return FAIL('INVALID_DURATION', 'Duration must be a whole number of minutes.');
  }
  if (duration <= 0) {
    return FAIL('INVALID_DURATION', 'Duration must be greater than zero minutes.');
  }
  if (duration > MAX_DURATION) {
    return FAIL(
      'INVALID_DURATION',
      `Duration must not exceed ${MAX_DURATION} minutes (requested ${duration}).`
    );
  }
  return { minutes: duration };
}

export function checkAvailability(
  start: number,
  end: number,
  currentMinutes: number,
  room: Room | undefined,
  bookings: Booking[]
): AvailabilityResult {
  if (!room) {
    return FAIL('ROOM_MISSING', 'Please select a room.', 'unavailable');
  }

  if (
    typeof start !== 'number' || !Number.isFinite(start) || !Number.isInteger(start) ||
    typeof end !== 'number' || !Number.isFinite(end) || !Number.isInteger(end)
  ) {
    return FAIL('INVALID_INTERVAL', 'Start and end must be whole numbers of minutes.');
  }

  // AC1 – interval bounds
  if (start < 0 || end > MINUTES_PER_DAY || start >= end) {
    return FAIL(
      'INVALID_INTERVAL',
      'Invalid interval. Start must be earlier than end, and both must be within 00:00–24:00.'
    );
  }

  // AC1 – start must be after current time
  if (start <= currentMinutes) {
    return FAIL(
      'START_NOT_IN_FUTURE',
      `Start time must be after the current time (${minutesToLabel(currentMinutes)}).`
    );
  }

  // AC2 – max duration
  if (end - start > MAX_DURATION) {
    return FAIL(
      'INVALID_DURATION',
      `Booking exceeds the ${MAX_DURATION}-minute limit (requested ${end - start} minutes).`
    );
  }

  // AC4 – room blocked
  if (room.blocked) {
    return FAIL(
      'ROOM_BLOCKED',
      `${room.name} is currently blocked and cannot be booked.`,
      'unavailable'
    );
  }

  // AC3 – overlap check (touching endpoints allowed, so use strict <)
  const roomBookings = bookings.filter((b) => b.roomId === room.id);
  const overlap = roomBookings.find((b) => start < b.end && b.start < end);

  if (overlap) {
    return FAIL(
      'ROOM_OVERLAP',
      `Overlaps with "${overlap.title}" (${minutesToLabel(overlap.start)}–${minutesToLabel(overlap.end)}).`,
      'unavailable'
    );
  }

  return AVAILABLE;
}

export interface DurationCheckInput {
  start: number;
  duration: number;
  currentMinutes: number;
  room: Room | undefined;
  bookings: Booking[];
}

/**
 * AC1: start > current time; AC2: 0 < duration <= 120 (also guarantees start < end);
 * AC4: room not blocked; AC3: no overlap (touching endpoints allowed).
 */
export function checkAvailabilityWithDuration({
  start,
  duration,
  currentMinutes,
  room,
  bookings,
}: DurationCheckInput): AvailabilityResult {
  const startResult = validateStart(start);
  if ('minutes' in startResult === false) return startResult as AvailabilityResult;

  const durationResult = validateDuration(duration);
  if ('minutes' in durationResult === false) return durationResult as AvailabilityResult;

  const end = startResult.minutes + durationResult.minutes;
  if (end > MINUTES_PER_DAY) {
    return FAIL(
      'INVALID_DURATION',
      'Requested interval ends after 24:00. Move the start earlier or shorten the duration.'
    );
  }

  return checkAvailability(startResult.minutes, end, currentMinutes, room, bookings);
}
