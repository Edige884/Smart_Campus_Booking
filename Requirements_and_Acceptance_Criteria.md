# Shared contract — Practice 12

User story: As a student, I want to check room availability for a selected start time and duration so that I can identify a free interval.

- **AC1:** Start time strictly after the fixed 09:00 clock.
- **AC2:** Duration is a whole number of minutes from 1 to 120 inclusive.
- **AC3:** An interval that overlaps an existing booking is unavailable.
- **AC4:** A blocked room is unavailable.
- **AC5:** Display a clear decision; do not modify existing booking data.
- **AC6:** Show understandable validation feedback for invalid inputs.

Inputs: HH:mm start, whole-minute duration, blocked flag, fictional booking list. Output: availability boolean, reason code, visible status/message (code-based success message assembled in UI). Shared fixture: A-101, Building A, capacity 40, initially open; existing booking 10:00–11:00; fixed current time 09:00; one simulated day, end <= 24:00. Adjacent endpoints are allowed. No booking creation, persistence, real data or external API.

Overlap condition: `start < bookingEnd && end > bookingStart`.

Source: Lesson 12 Practice, pages 12–13, 23–27.
