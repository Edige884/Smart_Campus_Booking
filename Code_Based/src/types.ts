export interface Booking {
  id: string;
  roomId: string;
  title: string;
  start: number; // minutes from 00:00
  end: number;   // minutes from 00:00
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export type ReasonCode =
  | 'OK'
  | 'ROOM_MISSING'
  | 'INVALID_START'
  | 'INVALID_DURATION'
  | 'INVALID_INTERVAL'
  | 'START_NOT_IN_FUTURE'
  | 'ROOM_BLOCKED'
  | 'ROOM_OVERLAP';

export type DecisionKind = 'available' | 'unavailable' | 'validation_error';

export interface AvailabilityResult {
  available: boolean;
  kind: DecisionKind;
  reasonCode: ReasonCode;
  message: string | null;
}
