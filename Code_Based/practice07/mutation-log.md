# Practice 07 – Mutation Testing Log

**Date:** 2026-10-13
**Suite file:** `src/checkAvailability.test.ts` (18 tests, T01–T18)
**Target file:** `src/checkAvailability.ts`
**Method:** One mutation at a time, tests run with `npx vitest run`, restore after each trial.

---

## Summary Table

| Mutation ID | Deliberate Defect | Failed Tests | Result |
|-------------|-------------------|--------------|--------|
| M1 | Duration check changed from `> 120` to `>= 120` (rejects exactly-120-min bookings) | T06 | **Detected** |
| M2 | Overlap condition changed from `start < b.end && b.start < end` to `start <= b.end && b.start <= end` (touching endpoints treated as overlap) | T01, T08, T16 | **Detected** |
| M3 | Blocked-room rejection removed entirely (blocked rooms can be booked) | T13 | **Detected** |

---

## Trial M1 — Duration boundary `>` changed to `>=`

**Mutation:** Line 57 of `checkAvailability.ts`:
```
- if (end - start > MAX_DURATION) {
+ if (end - start >= MAX_DURATION) {
```

**Effect:** A booking of exactly 120 minutes (the maximum allowed) is now
rejected. The boundary condition is off-by-one.

**Test run output:**
```
Test Files  1 failed (1)
     Tests  1 failed | 17 passed (18)
```

**Failing test:**
- **T06** – interval 720→840 available (exactly 120min, future, no overlap)
  - Expected `available: true`, received `available: false`

**Detection:** T06 specifically tests the boundary case of exactly 120 minutes.
It caught the off-by-one defect. The mutation was **detected**.

**Restoration:** `>=` reverted to `>`. Verified by subsequent M2 baseline run.

---

## Trial M2 — Overlap condition treats touching endpoints as overlap

**Mutation:** Line 75 of `checkAvailability.ts`:
```
- (b) => start < b.end && b.start < end
+ (b) => start <= b.end && b.start <= end
```

**Effect:** Bookings that end exactly when another starts (e.g., 570→600 when
600→660 exists) are now incorrectly considered overlapping. The "touching
endpoints allowed" rule (AC4) is violated.

**Test run output:**
```
Test Files  1 failed (1)
     Tests  3 failed | 15 passed (18)
```

**Failing tests:**
- **T01** – interval 660→720 available (no overlap, future, ≤120min)
  - Booking ends at 660, existing starts at 660 — touching, should be allowed
  - Expected `available: true`, received `available: false`
- **T08** – interval 570→600 available (ends when existing booking starts)
  - Requested ends at 600, existing starts at 600 — touching, should be allowed
  - Expected `available: true`, received `available: false`
- **T16** – interval 541→600 available (start just after current 540)
  - Requested ends at 600, existing starts at 600 — touching, should be allowed
  - Expected `available: true`, received `available: false`

**Detection:** T01 and T08 were the expected detectors per the task
specification. T16 also caught the defect as a bonus since it also involves a
touching endpoint at 600. The mutation was **detected**.

**Restoration:** `<=` reverted to `<`. Verified by subsequent M3 baseline run.

---

## Trial M3 — Blocked-room rejection removed

**Mutation:** Lines 64–69 of `checkAvailability.ts` — the entire `if (room.blocked)`
block was commented out:
```
- if (room.blocked) {
-   return {
-     available: false,
-     reason: `${room.name} is currently blocked and cannot be booked.`,
-   };
- }
+ // (entire block commented out)
```

**Effect:** A blocked room can now be booked, violating AC3. The function
falls through to the overlap check and returns `available: true` if no
overlap exists.

**Test run output:**
```
Test Files  1 failed (1)
     Tests  1 failed | 17 passed (18)
```

**Failing test:**
- **T13** – interval 660→720 unavailable when room is blocked (blocked reason)
  - Room is set to `blocked: true`, no overlap with existing bookings
  - Expected `available: false`, received `available: true`

**Detection:** T13 specifically tests the blocked-room scenario and caught the
removed rejection. The mutation was **detected**.

**Restoration:** Blocked-room block uncommented. Verified by final baseline run.

---

## Final Restored Baseline

After all three trials and restorations, the complete suite was run again:

```
Test Files  1 passed (1)
     Tests  18 passed (18)
```

All 18 tests (T01–T18) pass with the original correct implementation restored.

---

## Conclusion

All three mutations were **detected** by the test suite:

| Mutation | Killing test(s) | Mutation survived? |
|----------|-----------------|-------------------|
| M1 | T06 | No — detected |
| M2 | T01, T08, T16 | No — detected |
| M3 | T13 | No — detected |

Mutation score for this trial set: **3/3 (100%)**.

No syntax or import errors were encountered during any trial — all mutations
were clean semantic changes that compiled and ran successfully.
