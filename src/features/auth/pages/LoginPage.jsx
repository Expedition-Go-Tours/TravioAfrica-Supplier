import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const login = useAuthStore((state) => state.login);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleSignIn = async () => {
    setError("");

    if (!auth || !googleProvider) {
      setError("Authentication service is unavailable. Please try again later.");
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await api.post(
        "/auth/verify-token",
        { token: idToken },
        { withCredentials: true }
      );

      const responseData = response.data?.data || response.data;
      const userData = responseData?.user;
      const supplierProfile = responseData?.supplierProfile || null;

      if (!userData) {
        throw new Error("Backend did not return user data.");
      }

      login(userData, idToken, supplierProfile);
      toast.success(`Welcome back, ${userData.name || userData.email}!`);

      const returnUrl = localStorage.getItem("auth_return_url");
      const hasSupplierRole = userData.roles?.includes("supplier");
      const isVerified =
        supplierProfile?.status === "ACTIVE" ||
        supplierProfile?.status === "APPROVED";

      if (returnUrl) {
        localStorage.removeItem("auth_return_url");
        navigate(returnUrl, { replace: true });
      } else if (hasSupplierRole && isVerified) {
        navigate("/", { replace: true });
      } else {
        navigate("/supplier/status", { replace: true });
      }
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("");
        return;
      }
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Sign in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#044b3b] mb-4">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Supplier Dashboard</h1>
          <p className="text-sm text-[#64748b] mt-1">
            Sign in with your Google account to manage your tours and bookings
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm p-8">
          {error && (
            <div className="flex items-start gap-3 p-3 bg-[#fef2f2] border border-[#fca5a5] rounded-lg mb-6">
              <AlertCircle size={18} className="text-[#dc2626] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#991b1b]">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[#eaeaea] rounded-lg text-sm font-medium text-[#1e293b] hover:bg-[#f8fafc] hover:border-[#044b3b] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin text-[#044b3b]" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>

          <div className="mt-6 text-center">
            <a
              href="https://travioafrica.com/login"
              className="text-xs text-[#64748b] hover:text-[#044b3b] transition-colors"
            >
              Log in via the main site instead
            </a>
          </div>
        </div>

        <p className="text-xs text-center text-[#9e9e9e] mt-6">
          Only approved suppliers can access the dashboard.
          <br />
          <a
            href="https://travioafrica.com/become-a-supplier"
            className="text-[#044b3b] hover:underline"
          >
            Apply to become a supplier
          </a>
        </p>
      </div>
    </div>
  );
}