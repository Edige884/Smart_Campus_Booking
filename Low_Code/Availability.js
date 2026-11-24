export default {
  bookings: [
    {
      room: "A-101",
      title: "Existing Booking",
      start: "10:00",
      end: "11:00"
    }
  ],

  currentTime: 540,

  toMinutes(time) {
    const parts = time.split(":").map(Number);
    return parts[0] * 60 + parts[1];
  },

  toTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return String(h).padStart(2, "0") + ":" +
           String(m).padStart(2, "0");
  },

  validate(startTime, duration) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
      return {
        available: false,
        status: "Validation Error",
        reasonCode: "INVALID_START",
        message: "Enter a valid time in HH:mm format."
      };
    }

    const start = this.toMinutes(startTime);

    if (start <= this.currentTime) {
      return {
        available: false,
        status: "Validation Error",
        reasonCode: "START_NOT_IN_FUTURE",
        message: "Start time must be after 09:00."
      };
    }

    if (!Number.isInteger(duration) ||
        duration <= 0 || duration > 120) {
      return {
        available: false,
        status: "Validation Error",
        reasonCode: "INVALID_DURATION",
        message: "Duration must be between 1 and 120 minutes."
      };
    }

    if (start + duration > 1440) {
      return {
        available: false,
        status: "Validation Error",
        reasonCode: "INVALID_INTERVAL",
        message: "Booking cannot extend beyond 24:00."
      };
    }

    return null;
  },

  calculate(startTime, duration, blocked) {
    const error = this.validate(startTime, duration);

    if (error) {
      return error;
    }

    const start = this.toMinutes(startTime);
    const end = start + duration;

    if (blocked) {
      return {
        available: false,
        status: "Unavailable",
        reasonCode: "ROOM_BLOCKED",
        message: "Room A-101 is currently blocked."
      };
    }

    const overlap = this.bookings.some(b =>
      start < this.toMinutes(b.end) &&
      end > this.toMinutes(b.start)
    );

    if (overlap) {
      return {
        available: false,
        status: "Unavailable",
        reasonCode: "ROOM_OVERLAP",
        message: "Overlaps with existing booking 10:00–11:00."
      };
    }

    return {
      available: true,
      status: "Available",
      reasonCode: "OK",
      message: "A-101 is free for " +
        startTime + "–" + this.toTime(end) + "."
    };
  },

  async check() {
    const result = this.calculate(
      String(StartTime.text ?? "").trim(),
      Number(Duration.text),
      RoomBlocked.isSwitchedOn
    );

    await storeValue("result", result, false);

    return result;
  }
}
