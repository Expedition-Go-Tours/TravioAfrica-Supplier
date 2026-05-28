import api from "@/lib/axios";

export function getTravelerCount(travelers) {
  if (!travelers || typeof travelers !== "object") return 0;
  return (travelers.adults || 0) + (travelers.children || 0) + (travelers.infants || 0);
}

export function mapBookingRow(booking) {
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    customerName: booking.customer?.name || "—",
    customerEmail: booking.customer?.email || "",
    tourName: booking.tour?.title || "—",
    travelDate: booking.selectedDate,
    bookingDate: booking.createdAt,
    travelers: getTravelerCount(booking.travelers),
    total: Number(booking.total) || 0,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    currency: booking.currency || "USD",
    supplierNotes: booking.supplierNotes || "",
    tourId: booking.tourId,
  };
}

export async function fetchSupplierBookings(params = {}) {
  const response = await api.get("/bookings/supplier/bookings", {
    params,
    skipGlobalErrorHandler: true,
  });

  const payload = response.data?.data || {};
  return {
    bookings: (payload.bookings || []).map(mapBookingRow),
    pagination: payload.pagination || null,
  };
}

export function updateBookingStatus(id, { status, supplierNotes }) {
  return api.patch(
    `/bookings/${id}/status`,
    { status, supplierNotes },
    { skipGlobalErrorHandler: true }
  );
}
