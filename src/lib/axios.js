import axios from "axios";
import config from "@/config";
import { retryWithBackoff, isRetryableError, handleApiError } from "./errorHandler";

const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  withCredentials: true, // Required: send & accept cookies on every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (config.isDevelopment() && config.monitoring.debugMode) {
      console.log('🌐 API Request:', {
        method: requestConfig.method?.toUpperCase(),
        url: requestConfig.url,
        data: requestConfig.data,
      });
    }
    
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (config.isDevelopment() && config.monitoring.debugMode) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (config.isDevelopment()) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: originalRequest?.url,
        message: error.message,
        response: error.response?.data,
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear local auth state. The primary session is the HTTP-only
      // __session cookie, so we also need the backend to clear it.
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      // Avoid redirect loops: only redirect if we are not already on the
      // auth callback or login-related route.
      const path = window.location.pathname;
      const isAuthPage = path === "/auth/callback" || path.startsWith("/auth/");
      if (!isAuthPage) {
        // Redirect to the main site login. After login, the user can click
        // "Become a supplier" again and be redirected back with a fresh
        // Firebase ID token in ?token=...
        console.error("🔒 401 Unauthorized - Session expired. Redirecting to main site login.");
        window.location.href = "https://travioafrica.com/login?redirect=supplier";
      }
      return Promise.reject(error);
    }

    // Retry logic for retryable errors
    if (isRetryableError(error) && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      // Only retry up to configured max attempts
      if (originalRequest._retryCount <= config.api.retryAttempts) {
        try {
          // Retry with exponential backoff
          return await retryWithBackoff(
            () => api.request(originalRequest),
            config.api.retryAttempts - originalRequest._retryCount,
            1000
          );
        } catch (retryError) {
          // If all retries failed, handle the error
          handleApiError(retryError);
          return Promise.reject(retryError);
        }
      }
    }

    // Handle other errors
    handleApiError(error);
    return Promise.reject(error);
  }
);

/**
 * Helper function to make API requests with automatic retry
 */
export async function apiRequest(requestFn) {
  try {
    return await retryWithBackoff(requestFn, config.api.retryAttempts);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export default api;
