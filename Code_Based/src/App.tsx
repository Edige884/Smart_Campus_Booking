import { AlertCircle, CheckCircle2, Clock, DoorClosed, MapPin, Users, CalendarCheck, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ROOMS, BOOKINGS } from './sampleData';
import type { AvailabilityResult, Room } from './types';
import {
  MAX_DURATION,
  checkAvailabilityWithDuration,
  labelToMinutes,
  minutesToLabel,
  validateTimeLabel,
} from './checkAvailability';
import Timeline from './components/Timeline';

const FIXED_CURRENT_MINUTES = 540; // 09:00

function formatTimeInput(raw: string): string {
  const cleaned = raw.replace(/[^\d:]/g, '').slice(0, 5);
  if (!cleaned.includes(':') && cleaned.length >= 3) {
    return cleaned.slice(0, 2) + ':' + cleaned.slice(2);
  }
  return cleaned;
}

function formatDurationInput(raw: string): string {
  return raw.replace(/[^\d]/g, '').slice(0, 3);
}

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isEnd: boolean;
}

function TimeInput({ label, value, onChange, isEnd }: TimeInputProps) {
  const [touched, setTouched] = useState(false);
  const validation = validateTimeLabel(value, isEnd);
  const showError = touched && 'error' in validation;

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        placeholder={isEnd ? 'HH:MM (24:00 ok)' : 'HH:MM'}
        onChange={(e) => onChange(formatTimeInput(e.target.value))}
        onBlur={() => setTouched(true)}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 transition-colors ${
          showError
            ? 'border-red-300 focus:ring-red-200 focus:border-red-400 text-red-700'
            : 'border-slate-300 focus:ring-slate-800/10 focus:border-slate-500 text-slate-800'
        }`}
        maxLength={5}
        aria-label={label}
        aria-invalid={showError}
      />
      {showError ? (
        <p className="text-xs text-red-500 mt-1">{(validation as { error: string }).error}</p>
      ) : isEnd ? null : (
        <p className="text-xs text-slate-400 mt-1">Must be after {minutesToLabel(FIXED_CURRENT_MINUTES)}.</p>
      )}
    </div>
  );
}

interface DurationInputProps {
  value: string;
  onChange: (value: string) => void;
}

function DurationInput({ value, onChange }: DurationInputProps) {
  const [touched, setTouched] = useState(false);
  const parsed = parseInt(value, 10);
  const valid = Number.isInteger(parsed) && parsed > 0 && parsed <= MAX_DURATION;
  const showError = touched && !valid;

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">Duration (minutes)</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        placeholder={`1–${MAX_DURATION}`}
        onChange={(e) => onChange(formatDurationInput(e.target.value))}
        onBlur={() => setTouched(true)}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 transition-colors ${
          showError
            ? 'border-red-300 focus:ring-red-200 focus:border-red-400 text-red-700'
            : 'border-slate-300 focus:ring-slate-800/10 focus:border-slate-500 text-slate-800'
        }`}
        maxLength={3}
        aria-label="Duration in minutes"
        aria-invalid={showError}
      />
      {showError ? (
        <p className="text-xs text-red-500 mt-1">
          {value.length === 0 || parsed === 0
            ? 'Duration must be greater than zero minutes.'
            : `Duration must not exceed ${MAX_DURATION} minutes.`}
        </p>
      ) : (
        <p className="text-xs text-slate-400 mt-1">Max {MAX_DURATION} minutes.</p>
      )}
    </div>
  );
}

const RESULT_STYLES = {
  available: {
    wrap: 'border-emerald-200 bg-emerald-50',
    title: 'text-emerald-700',
    body: 'text-emerald-600',
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />,
    label: 'Available',
  },
  unavailable: {
    wrap: 'border-red-200 bg-red-50',
    title: 'text-red-700',
    body: 'text-red-600',
    icon: <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />,
    label: 'Unavailable',
  },
  validation_error: {
    wrap: 'border-amber-200 bg-amber-50',
    title: 'text-amber-700',
    body: 'text-amber-600',
    icon: <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />,
    label: 'Validation Error',
  },
} as const;

export default function App() {
  const [room, setRoom] = useState<Room>(() => ({ ...ROOMS[0] }));
  const [startTime, setStartTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<string>('60');
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const currentMinutes = FIXED_CURRENT_MINUTES;

  const roomBookings = useMemo(
    () => BOOKINGS.filter((b) => b.roomId === room.id),
    [room]
  );

  const startMin = labelToMinutes(startTime);
  const durationNum = parseInt(duration, 10);
  const durationValid = Number.isInteger(durationNum) && durationNum > 0 && durationNum <= MAX_DURATION;
  const endMin = startMin !== null && durationValid ? startMin + durationNum : null;

  const handleCheck = () => {
    const startVal = validateTimeLabel(startTime, false);
    if ('error' in startVal) {
      setResult({ available: false, kind: 'validation_error', reasonCode: 'INVALID_START', message: startVal.error });
      return;
    }
    if (!durationValid) {
      setResult({
        available: false,
        kind: 'validation_error',
        reasonCode: 'INVALID_DURATION',
        message:
          durationNum === 0
            ? 'Duration must be greater than zero minutes.'
            : `Duration must be a whole number between 1 and ${MAX_DURATION} minutes.`,
      });
      return;
    }
    setResult(
      checkAvailabilityWithDuration({
        start: startVal.minutes,
        duration: durationNum,
        currentMinutes,
        room,
        bookings: BOOKINGS,
      })
    );
  };

  const toggleBlocked = () => {
    setRoom((prev) => ({ ...prev, blocked: !prev.blocked }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
              Smart Campus Room Availability
            </h1>
            <p className="text-sm text-slate-500">Check a room, start time, and duration before booking</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Current time banner */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-800 text-white px-4 py-3">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">
            Current time: {minutesToLabel(currentMinutes)} (fixed for testing)
          </span>
        </div>

        {/* Form card */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Check availability</h2>

          {/* Room card */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-600 mb-2">Room</label>
            <div className="rounded-xl border border-slate-200 bg-white p-4 max-w-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-slate-800">{room.name}</span>
                {room.blocked ? (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    Blocked
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Open
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5">
                <MapPin className="w-3 h-3" /> {room.building}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Users className="w-3 h-3" /> Capacity {room.capacity}
              </div>
              <button
                onClick={toggleBlocked}
                className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  room.blocked
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                {room.blocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {room.blocked ? 'Unblock room' : 'Block room'}
              </button>
            </div>
          </div>

          {/* Time + duration inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="sm:col-span-1">
              <TimeInput
                label="Start time"
                value={startTime}
                onChange={setStartTime}
                isEnd={false}
              />
            </div>
            <div className="sm:col-span-1">
              <DurationInput value={duration} onChange={setDuration} />
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 sm:col-span-1">
              <p className="text-xs font-medium text-slate-500 mb-0.5">End time (calculated)</p>
              <p className="text-lg font-semibold text-slate-800 tabular-nums">
                {startMin !== null && durationValid && endMin !== null && endMin <= 1440
                  ? minutesToLabel(endMin)
                  : <span className="text-slate-400">—</span>}
              </p>
              <p className="text-xs text-slate-400 mt-1">Start + duration, computed automatically.</p>
            </div>
          </div>

          {/* Check button */}
          <button
            onClick={handleCheck}
            className="w-full sm:w-auto rounded-lg bg-slate-800 text-white px-6 py-2.5 text-sm font-semibold hover:bg-slate-700 active:bg-slate-900 transition-colors"
          >
            Check Availability
          </button>
        </section>

        {/* Timeline */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <DoorClosed className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-800">
              {room.name} — today's schedule
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-3">Scroll horizontally to see the full day (00:00–24:00).</p>
          <Timeline
            bookings={roomBookings}
            candidateStart={startMin !== null && durationValid && endMin !== null && endMin <= 1440 ? startMin : null}
            candidateEnd={endMin !== null && endMin <= 1440 ? endMin : null}
          />
        </section>

        {/* Result */}
        {result && (
          <section
            className={`rounded-2xl border p-5 sm:p-6 transition-all ${RESULT_STYLES[result.kind].wrap}`}
          >
            <div className="flex items-start gap-3">
              {RESULT_STYLES[result.kind].icon}
              <div>
                <h3 className={`text-base font-bold ${RESULT_STYLES[result.kind].title}`}>
                  {RESULT_STYLES[result.kind].label}
                </h3>
                {result.available ? (
                  <p className={`text-sm mt-0.5 ${RESULT_STYLES[result.kind].body}`}>
                    {room.name} is free for {startTime}–{endMin !== null ? minutesToLabel(endMin) : ''}. You can proceed with booking.
                  </p>
                ) : (
                  <p className={`text-sm mt-0.5 ${RESULT_STYLES[result.kind].body}`}>
                    <span className="font-medium">{room.name}, {startTime}–{startMin !== null && durationValid && endMin !== null && endMin <= 1440 ? minutesToLabel(endMin) : duration + ' min'}:</span>{' '}
                    {result.message}
                  </p>
                )}
                <p className="text-[10px] font-mono text-slate-400 mt-1.5 uppercase tracking-wide">
                  Reason code: {result.reasonCode}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Existing bookings list */}
        {roomBookings.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-3">Existing bookings</h2>
            <ul className="divide-y divide-slate-100">
              {roomBookings
                .slice()
                .sort((a, b) => a.start - b.start)
                .map((b) => (
                  <li key={b.id} className="flex items-center justify-between py-2.5">
                    <span className="text-sm font-medium text-slate-700">{b.title}</span>
                    <span className="text-sm text-slate-400 tabular-nums">
                      {minutesToLabel(b.start)} – {minutesToLabel(b.end)}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        <footer className="text-center text-xs text-slate-400 pb-4">
          Fictional sample data for demonstration purposes only.
        </footer>
      </main>
    </div>
  );
}
