import api from "@/lib/axios";

export async function fetchCurrentUser() {
  const response = await api.get("/users/me", { skipGlobalErrorHandler: true });
  return response.data?.data?.user || null;
}

export function updateCurrentUser(data) {
  return api.patch("/users/updateMe", data, { skipGlobalErrorHandler: true });
}
