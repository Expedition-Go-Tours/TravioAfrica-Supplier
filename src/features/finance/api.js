import api from "@/lib/axios";

export async function fetchEarnings(params = {}) {
  const response = await api.get("/suppliers/earnings", {
    params,
    skipGlobalErrorHandler: true,
  });

  const payload = response.data?.data || {};
  return {
    earnings: (payload.earnings || []).map((item) => ({
      id: item.id,
      bookingNumber: item.bookingNumber,
      date: item.paidAt || item.selectedDate,
      travelDate: item.selectedDate,
      tour: item.tour?.title || "—",
      customer: item.customer?.name || "—",
      total: Number(item.total) || 0,
      supplierPayout: Number(item.supplierPayout) || 0,
      commissionAmount: Number(item.commissionAmount) || 0,
      commissionRate: Number(item.commissionRate) || 0,
      currency: item.currency || "USD",
    })),
    summary: payload.summary || {},
    pagination: payload.pagination || null,
  };
}

export async function fetchPayouts(params = {}) {
  const response = await api.get("/payouts/me", {
    params,
    skipGlobalErrorHandler: true,
  });

  const payload = response.data?.data || {};
  return {
    payouts: (payload.payouts || []).map((payout) => ({
      id: payout.id,
      amount: Number(payout.amount) || 0,
      status: payout.status,
      date: payout.paidAt || payout.processedAt || payout.createdAt,
      currency: payout.currency || "USD",
      bookingNumber: payout.booking?.bookingNumber || "—",
      tour: payout.booking?.tour?.title || "—",
      method: payout.payoutMethod?.type?.replace(/_/g, " ") || payout.paymentMethod || "—",
      account:
        payout.payoutMethod?.accountNumber?.slice(-4) ||
        payout.payoutMethod?.mobileNumber?.slice(-4) ||
        payout.payoutMethod?.paypalEmail ||
        "—",
      reference: payout.reference || "",
    })),
    summary: payload.summary || {},
    pagination: payload.pagination || null,
  };
}

export async function fetchPayoutMethods() {
  const response = await api.get("/payout-methods/me", { skipGlobalErrorHandler: true });
  const payload = response.data?.data || {};
  return payload.methods || [];
}

export function createPayoutMethod(data) {
  return api.post("/payout-methods", data, { skipGlobalErrorHandler: true });
}

export function updatePayoutMethod(id, data) {
  return api.patch(`/payout-methods/${id}`, data, { skipGlobalErrorHandler: true });
}

export function deletePayoutMethod(id) {
  return api.delete(`/payout-methods/${id}`, { skipGlobalErrorHandler: true });
}
