# Smart Campus Room Availability Checker

A single-page React + TypeScript app for checking whether a fictional campus
room is available for a requested time slot. The app makes availability
decisions only — it never creates, stores, or edits bookings. All data is
fictional sample data for demonstration purposes.

## Architecture

| File | Purpose |
|------|---------|
| `src/checkAvailability.ts` | Pure booking-rule functions: `checkAvailability`, `labelToMinutes`, `validateTimeLabel`, `minutesToLabel`. Exports `MAX_DURATION = 120`. |
| `src/App.tsx` | Main page: room card with block/unblock toggle, start/end time inputs, duration preview, Check Availability button, result panel, existing-bookings list. |
| `src/components/Timeline.tsx` | Day timeline (00:00–24:00) showing existing bookings and the candidate interval. |
| `src/sampleData.ts` | Fixture data: one room (`a101` / A-101) and one booking (600–660 min / 10:00–11:00). |
| `src/types.ts` | Shared types: `Room`, `Booking`, `AvailabilityResult`. |
| `src/checkAvailability.test.ts` | Vitest suite (T01–T22) covering AC1–AC4, fixture immutability (AC5), and time-label parsing. |

## Setup

```bash
npm install
```

Requires Node.js (LTS recommended) and npm.

## Verification commands

| Command | Purpose |
|---------|---------|
| `npm test` | Run the Vitest test suite (22 tests). |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run `tsc --noEmit` type checking. |
| `npm run build` | Produce a production build in `dist/`. |
| `npm run dev` | Start the local dev server (not a verification step). |

## Acceptance criteria (AC1–AC6)

- **AC1** — Reject invalid intervals (`start >= end`) and past requests (`start <= currentMinutes`). Valid bounds: `0 <= start < end <= 1440` (24:00 is a valid end, not a start).
- **AC2** — Reject durations greater than 120 minutes (exactly 120 is allowed).
- **AC3** — Reject bookings for blocked rooms.
- **AC4** — Reject overlapping bookings; allow intervals that touch at endpoints. Bookings for other rooms are ignored.
- **AC5** — Never mutate booking fixtures and never create bookings.
- **AC6** — Keep clear, responsive feedback in the UI on both desktop and mobile.

## Limitations

- One fictional room only; no persistence, backend, authentication, or database.
- The block/unblock toggle is an in-memory UI control for demonstration; it resets on reload.
- "Current time" is fixed at 09:00 (540 minutes) for deterministic testing.
- No UI/component tests; AC6 is verified manually.
- `practice07/` artifacts are historical and partly stale; the source of truth is the `src/` files listed above.

## Agent instructions

See `AGENTS.md` for engineering rules, forbidden actions, and review requirements.
