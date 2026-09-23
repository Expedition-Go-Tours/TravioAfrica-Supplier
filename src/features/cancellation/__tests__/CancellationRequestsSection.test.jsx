import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import CancellationRequestsSection from "../components/CancellationRequestsSection";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://expedition-go-backend-v2.onrender.com/api";

const pendingRequest = {
  id: "cr-1",
  status: "PENDING_APPROVAL",
  bookingId: "BK-1",
  booking: {
    id: "BK-1",
    bookingNumber: "TGA-78234",
    status: "CONFIRMED",
    paymentStatus: "SUCCEEDED",
    currency: "USD",
    grossAmount: 2400,
    travelDate: "2026-06-15",
  },
  tour: { id: "tour-1", title: "Serengeti Safari Adventure" },
  payload: {
    cancellationCode: "GUIDE_UNAVAILABLE",
    cancellationCategory: "OPERATIONAL",
    explanation: "Guide fell ill",
    evidenceUrl: null,
    customerRefundAgreed: null,
    agreedToTerms: true,
  },
  preview: { refund: { amount: 2400 }, fee: 600, countsTowardRate: true },
  stopSellingApplied: true,
  batchId: "cb_1",
  decidedBy: null,
  decidedAt: null,
  decisionNote: null,
  createdAt: "2026-06-01T10:00:00.000Z",
  updatedAt: "2026-06-01T10:00:00.000Z",
};

function listHandler(requests) {
  return http.get(`${API_BASE_URL}/bookings/supplier/cancellation-requests`, () =>
    HttpResponse.json({
      status: "success",
      data: {
        requests,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: requests.length,
          limit: 50,
        },
      },
    })
  );
}

describe("CancellationRequestsSection", () => {
  beforeEach(() => {
    localStorage.setItem("auth_token", "test-token");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("lists a pending request with its reason, preview and stop-selling flag", async () => {
    server.use(listHandler([pendingRequest]));

    render(<CancellationRequestsSection />);

    expect(await screen.findByText("TGA-78234")).toBeInTheDocument();
    expect(screen.getByText("Serengeti Safari Adventure")).toBeInTheDocument();
    expect(screen.getByText("Pending approval")).toBeInTheDocument();
    expect(screen.getByText(/Guide unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/Stop-selling active/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Withdraw$/i })).toBeInTheDocument();
  });

  it("withdraws a pending request after the confirm dialog", async () => {
    const withdrawSpy = vi.fn();
    server.use(
      listHandler([pendingRequest]),
      http.post(
        `${API_BASE_URL}/bookings/supplier/cancellation-requests/:id/withdraw`,
        ({ params }) => {
          withdrawSpy(params.id);
          return HttpResponse.json({
            status: "success",
            data: {
              request: { ...pendingRequest, status: "WITHDRAWN" },
              revertedDates: 2,
            },
          });
        }
      )
    );

    render(<CancellationRequestsSection />);

    fireEvent.click(
      await screen.findByRole("button", { name: /^Withdraw$/i })
    );
    expect(
      await screen.findByText("Withdraw cancellation request?")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Withdraw request/i }));

    await waitFor(() => expect(withdrawSpy).toHaveBeenCalledWith("cr-1"));
  });

  it("shows the decision info on a decided request", async () => {
    server.use(
      listHandler([
        {
          ...pendingRequest,
          status: "REJECTED",
          stopSellingApplied: false,
          decidedAt: "2026-06-02T09:00:00.000Z",
          decidedBy: { id: "admin-1", name: "Ops Admin" },
          decisionNote: "Dates were resold",
        },
      ])
    );

    render(<CancellationRequestsSection />);

    expect(await screen.findByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText(/Ops Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Dates were resold/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Withdraw$/i })).toBeNull();
  });
});
