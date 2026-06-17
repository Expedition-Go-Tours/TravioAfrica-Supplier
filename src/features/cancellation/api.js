import api from "@/lib/axios";

export async function fetchCancellationSummary(productId) {
  const params = productId ? { productId } : {};
  const response = await api.get("/suppliers/cancellation/summary", {
    params,
    skipGlobalErrorHandler: true,
  });
  return response.data?.data || null;
}

export async function fetchCancellationRecords({ productId, page = 1, limit = 25 } = {}) {
  const params = { page, limit };
  if (productId) params.productId = productId;
  const response = await api.get("/suppliers/cancellation/records", {
    params,
    skipGlobalErrorHandler: true,
  });
  const payload = response.data?.data || {};
  return {
    records: payload.records || [],
    pagination: payload.pagination || null,
  };
}

export async function fetchCancellationProducts() {
  const response = await api.get("/suppliers/products/list", {
    skipGlobalErrorHandler: true,
  });
  return (response.data?.data?.products || []).map((p) => ({
    id: p.id,
    name: p.title,
  }));
}
