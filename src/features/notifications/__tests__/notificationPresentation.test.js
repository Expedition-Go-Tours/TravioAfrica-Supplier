import { describe, expect, it } from "vitest";
import { mapBackendNotification } from "../utils/notificationPresentation";
import { NOTIFICATION_TYPES } from "../constants";

function notification(type, data = {}) {
  return {
    id: "n-1",
    type,
    title: "Decision",
    message: "…",
    createdAt: "2026-06-01T10:00:00.000Z",
    read: false,
    data,
  };
}

describe("cancellation decision notifications", () => {
  it("maps an approved decision to a cancellation label and booking link", () => {
    const mapped = mapBackendNotification(
      notification("CANCELLATION_REQUEST_APPROVED", {
        bookingId: "BK-1",
        bookingNumber: "TGA-1",
        tourTitle: "Safari",
        decision: "APPROVED",
        note: null,
      })
    );

    expect(mapped.type).toBe("cancellationApproved");
    expect(mapped.action).toBe("/bookings?bookingId=BK-1");
    expect(mapped.actionLabel).toBe("View Booking");
    expect(mapped.backendType).toBe("CANCELLATION_REQUEST_APPROVED");
    expect(NOTIFICATION_TYPES[mapped.type].label).toBe("Cancellation approved");
    expect(NOTIFICATION_TYPES[mapped.type].icon).toBeTruthy();
  });

  it("maps a rejected decision to a cancellation-rejected presentation", () => {
    const mapped = mapBackendNotification(
      notification("CANCELLATION_REQUEST_REJECTED", {
        bookingId: "BK-2",
        bookingNumber: "TGA-2",
        decision: "REJECTED",
        note: "Dates were resold",
      })
    );

    expect(mapped.type).toBe("cancellationRejected");
    expect(mapped.action).toBe("/bookings?bookingId=BK-2");
    expect(NOTIFICATION_TYPES[mapped.type].label).toBe("Cancellation rejected");
    expect(NOTIFICATION_TYPES[mapped.type].icon).toBeTruthy();
  });

  it("falls back to the bookings page when no bookingId is present", () => {
    const mapped = mapBackendNotification(
      notification("CANCELLATION_REQUEST_REJECTED", {
        bookingNumber: "TGA-3",
        note: "Not eligible",
      })
    );

    expect(mapped.action).toBe("/bookings");
    expect(mapped.actionLabel).toBe("View Bookings");
  });
});
