import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CancelBookingModal from "../components/CancelBookingModal";
import BulkCancelResult from "../components/BulkCancelResult";
import BookingCard from "../components/BookingCard";
import { mapBookingRow } from "../api";
import { resetCancellationRequests } from "@/test/mocks/handlers";

const booking = {
  id: "BK-1",
  bookingNumber: "TGA-78234",
  customerId: "cust-1",
  customerName: "John Smith",
  tourName: "Serengeti Safari Adventure",
  currency: "USD",
  total: 2400,
  status: "CONFIRMED",
  paymentStatus: "SUCCEEDED",
  paymentTiming: "now",
  travelDate: "2026-06-15",
  bookingDate: "2026-05-18",
  travelers: 2,
  travelersRaw: { adults: 2 },
  instantConfirmation: true,
  pickup: null,
  discount: 0,
};

/** Walk the structured wizard to the confirm panel and submit it. */
async function driveWizardToConfirm() {
  fireEvent.click(
    await screen.findByRole("radio", { name: /Operational issue/i })
  );
  fireEvent.click(
    screen.getByRole("radio", { name: /Guide or staff unavailable/i })
  );
  fireEvent.change(screen.getByLabelText(/What happened/i), {
    target: { value: "Guide fell ill and no replacement was available." },
  });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
  fireEvent.click(
    await screen.findByRole("button", { name: /Confirm cancellation/i })
  );
}

describe("single cancel — admin approval gate", () => {
  beforeEach(() => {
    localStorage.setItem("auth_token", "test-token");
  });
  afterEach(() => {
    localStorage.clear();
    resetCancellationRequests();
  });

  it("says the request is not yet effective when the gate parks it", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      booking,
      request: {
        id: "cr-1",
        status: "PENDING_APPROVAL",
        preview: { refund: { amount: 2400 }, fee: 0, countsTowardRate: false },
      },
    });

    render(
      <CancelBookingModal
        isOpen
        onClose={() => {}}
        onConfirm={onConfirm}
        booking={booking}
      />
    );

    await driveWizardToConfirm();

    expect(await screen.findByText("Submitted for review")).toBeInTheDocument();
    expect(screen.getByText("Cancellation submitted")).toBeInTheDocument();
    expect(screen.getByText("not effective yet")).toBeInTheDocument();
    expect(screen.getByText(/been notified/i)).toBeInTheDocument();
    expect(screen.getByText("Pending approval")).toBeInTheDocument();
    // The executed-only copy must not leak into the request screen.
    expect(screen.queryByText(/The customer has 48 hours/i)).toBeNull();
  });

  it("keeps the executed success screen when data.cancellation is returned", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      booking,
      cancellation: {
        refundStatus: "PENDING",
        refundAmount: 2400,
        fee: 600,
        countsTowardRate: true,
        choiceDeadline: "2026-06-17T10:00:00.000Z",
      },
    });

    render(
      <CancelBookingModal
        isOpen
        onClose={() => {}}
        onConfirm={onConfirm}
        booking={booking}
      />
    );

    await driveWizardToConfirm();

    expect(await screen.findByText("Booking cancelled")).toBeInTheDocument();
    expect(screen.getByText("Customer refund")).toBeInTheDocument();
    expect(screen.getByText(/The customer has 48 hours/i)).toBeInTheDocument();
    expect(screen.queryByText("Submitted for review")).toBeNull();
  });
});

describe("bulk cancel result — admin approval gate", () => {
  it("renders the submitted-for-review summary when the batch is gated", () => {
    render(
      <BulkCancelResult
        result={{
          matched: 3,
          requested: 2,
          skipped: 1,
          failed: 0,
          stopSellingApplied: true,
          blockedDates: ["2026-06-15", "2026-06-16"],
          results: [],
        }}
      />
    );

    expect(screen.getByText("Submitted for review")).toBeInTheDocument();
    expect(screen.getByText(/Nothing has been executed yet/i)).toBeInTheDocument();
    expect(screen.getByText("Skipped")).toBeInTheDocument();
    expect(screen.getByText(/Stopped accepting bookings/i)).toBeInTheDocument();
    // Executed-only labels must not appear.
    expect(screen.queryByText("Total refunded")).toBeNull();
  });

  it("keeps the executed summary when the batch ran immediately", () => {
    render(
      <BulkCancelResult
        result={{
          matched: 2,
          cancelled: 2,
          failed: 0,
          totalRefunded: 2400,
          totalFees: 300,
          blockedDates: [],
          results: [],
        }}
      />
    );

    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText("Total refunded")).toBeInTheDocument();
    expect(screen.queryByText("Submitted for review")).toBeNull();
  });
});

describe("booking row pending-cancellation chip", () => {
  it("maps pendingCancellation onto the booking row", () => {
    const pending = {
      id: "cr-9",
      status: "PENDING_APPROVAL",
      createdAt: "2026-06-01T10:00:00.000Z",
    };
    expect(mapBookingRow({ id: "BK-1", pendingCancellation: pending }).pendingCancellation).toEqual(
      pending
    );
    expect(mapBookingRow({ id: "BK-2" }).pendingCancellation).toBeNull();
  });

  it("shows a Pending approval chip with the request date and fires Withdraw", () => {
    const onWithdrawCancellation = vi.fn();
    render(
      <BookingCard
        booking={{
          ...booking,
          pendingCancellation: {
            id: "cr-9",
            status: "PENDING_APPROVAL",
            createdAt: "2026-06-01T10:00:00.000Z",
          },
        }}
        onStatusUpdate={() => {}}
        onMessageCustomer={() => {}}
        onWithdrawCancellation={onWithdrawCancellation}
      />
    );

    expect(screen.getByText("Pending approval")).toBeInTheDocument();
    expect(screen.getByText(/requested 01 Jun 2026/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    expect(onWithdrawCancellation).toHaveBeenCalledWith(
      expect.objectContaining({ id: "BK-1" })
    );
  });

  it("renders no chip when the row has no pending request", () => {
    render(
      <BookingCard
        booking={booking}
        onStatusUpdate={() => {}}
        onMessageCustomer={() => {}}
      />
    );
    expect(screen.queryByText("Pending approval")).toBeNull();
  });
});
