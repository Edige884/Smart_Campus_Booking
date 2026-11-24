# Practice 07 – Review Notes: Test Suite Improvements

**Date:** 2026-10-13
**Suite file:** `src/checkAvailability.test.ts`
**Original snapshot:** `practice07/first-suite.txt` (unchanged)

---

## Improvement 1: Rejection-reason assertions

### What changed

Added `expect(result.reason).toBe(...)` assertions to four existing tests that
already checked `result.available === false`:

| Test | AC | Reason string asserted |
|------|----|-----------------------|
| T03 | AC1 (invalid interval) | `"Invalid interval. Start must be earlier than end, and both must be within 00:00–24:00."` |
| T07 | AC2 (duration limit) | `"Booking exceeds the 120-minute limit (requested 121 minutes)."` |
| T09 | AC4 (booking overlap) | `"Overlaps with \"Test Booking\" (10:00–11:00)."` |
| T13 | AC3 (room blocked) | `"Room 101 is currently blocked and cannot be booked."` |

Each reason string is taken from the actual documented messages in
`checkAvailability.ts`. The `available` decision is unchanged — the original
boolean assertions are preserved.

The type guard `if (!result.available)` is used before accessing `result.reason`
so TypeScript narrows the union `{ available: true } | { available: false; reason: string }`
correctly.

### Defects this can detect

1. **Wrong rejection path triggered:** If a refactor accidentally causes the
   duration check to fire before the interval-bounds check (or vice versa), the
   boolean assertion still passes (`available === false`) but the reason string
   would differ, catching the routing error.

2. **Silent reason changes:** If someone modifies a message template (e.g.,
   changes the duration-limit text or drops the room name from the blocked
   message), the test fails — alerting developers that user-facing feedback has
   changed.

3. **Missing contextual details:** The overlap reason includes the booking title
   and formatted times. If `minutesToLabel` breaks or the wrong booking is
   reported as the overlap, the reason assertion catches it.

4. **Hardcoded constants drift:** T07 asserts `"120-minute limit"` and
   `"121 minutes"`. If `MAX_DURATION` is changed without updating tests, this
   surfaces the change explicitly.

---

## Improvement 2: Cross-room isolation test (T18)

### What changed

Added a new test T18 that verifies bookings belonging to a different room do not
affect availability of the selected room.

**Fixture:**
- Selected room: `r1` (Room 101)
- Bookings array: one booking for `r2` at 630→690 (which would overlap if it
  belonged to `r1`)
- Requested interval: 630→690 (exactly overlapping the other room's booking)

**Expected result:** `available: true` — because the overlap check filters
bookings by `roomId === room.id`, so `r2`'s booking is irrelevant to `r1`.

### Defects this can detect

1. **Missing room filter in overlap check:** If the `.filter((b) => b.roomId === room.id)`
   line is removed or broken, the function would see the `r2` booking as a
   conflict and incorrectly return `false` for `r1`. T18 catches this.

2. **Wrong room ID comparison:** If the filter uses a different field (e.g.,
   `b.id === room.id`) or a loose comparison that breaks isolation, T18 fails.

3. **Cross-room data leakage:** Ensures the function respects the logical
   boundary between rooms — a fundamental correctness property for a
   multi-room booking system.

---

## Tests not modified

- T01, T02, T04, T05, T06, T08, T10, T11, T12, T14, T15, T16, T17: unchanged.
- `checkAvailability.ts`, `sampleData.ts`, `types.ts`, `App.tsx`: not modified.
- `practice07/first-suite.txt`: not modified.

---

## Summary

| Improvement | Tests affected | New tests | Defect classes targeted |
|-------------|---------------|-----------|------------------------|
| Reason assertions | T03, T07, T09, T13 | — | Wrong rejection path, message drift, missing context, constant drift |
| Cross-room isolation | — | T18 | Missing room filter, wrong field comparison, cross-room leakage |

Total tests after improvements: **18** (T01–T18).
