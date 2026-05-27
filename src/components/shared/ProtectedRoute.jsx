import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore, isAdminUser, canAccessSupplierDashboard } from "@/stores/authStore";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ requireAdmin = false }) {
  const { isAuthenticated, isLoading, supplierProfile } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#044b3b]" />
          <p className="text-sm text-[#64748b]">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = isAdminUser();

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin && !canAccessSupplierDashboard(supplierProfile)) {
    return <Navigate to="/supplier/status" replace />;
  }

  return <Outlet />;
}