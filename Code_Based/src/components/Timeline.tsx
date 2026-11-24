import type { Booking } from '../types';
import { minutesToLabel } from '../checkAvailability';

interface TimelineProps {
  bookings: Booking[];
  candidateStart: number | null;
  candidateEnd: number | null;
}

// Each hour slot is 40px wide → 24 hours = 960px (scrollable on mobile)
const HOUR_WIDTH = 40;

export default function Timeline({ bookings, candidateStart, candidateEnd }: TimelineProps) {
  const hours = Array.from({ length: 25 }, (_, i) => i); // 0..24

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="min-w-[960px] p-4">
        {/* Hour labels */}
        <div className="flex relative mb-2" style={{ width: HOUR_WIDTH * 24 }}>
          {hours.map((h) => (
            <div
              key={h}
              className="text-[10px] text-slate-400 font-medium select-none"
              style={{ width: HOUR_WIDTH, textAlign: h === 0 ? 'left' : 'center', marginLeft: h === 0 ? 0 : -HOUR_WIDTH / 2 }}
            >
              {h === 24 ? '24' : String(h).padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* Track */}
        <div
          className="relative h-16 rounded-lg bg-slate-50 border border-slate-200"
          style={{ width: HOUR_WIDTH * 24 }}
        >
          {/* Hour gridlines */}
          {hours.slice(0, 24).map((h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 border-l border-slate-200"
              style={{ left: h * HOUR_WIDTH }}
            />
          ))}

          {/* Existing bookings */}
          {bookings.map((b) => (
            <div
              key={b.id}
              className="absolute top-1 bottom-1 rounded-md bg-slate-300/80 border border-slate-400/40 flex items-center px-1.5 overflow-hidden"
              style={{ left: b.start * (HOUR_WIDTH / 60), width: (b.end - b.start) * (HOUR_WIDTH / 60) }}
              title={`${b.title} (${minutesToLabel(b.start)}–${minutesToLabel(b.end)})`}
            >
              <span className="text-[9px] text-slate-700 font-medium whitespace-nowrap truncate">
                {b.title}
              </span>
            </div>
          ))}

          {/* Candidate interval */}
          {candidateStart !== null && candidateEnd !== null && candidateStart < candidateEnd && (
            <div
              className="absolute top-1 bottom-1 rounded-md border-2 border-dashed border-emerald-500 bg-emerald-400/25 flex items-center justify-center"
              style={{
                left: Math.max(0, candidateStart) * (HOUR_WIDTH / 60),
                width: (Math.min(1440, candidateEnd) - Math.max(0, candidateStart)) * (HOUR_WIDTH / 60),
              }}
            >
              <span className="text-[9px] text-emerald-700 font-bold whitespace-nowrap">
                {minutesToLabel(candidateStart)}–{minutesToLabel(candidateEnd)}
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-300" />
            <span>Existing booking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-dashed border-emerald-500 bg-emerald-400/25" />
            <span>Your request</span>
          </div>
        </div>
      </div>
    </div>
  );
}
