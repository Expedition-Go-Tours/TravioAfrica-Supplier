import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const SPLASH_DURATION_MS = 1800;

export default function LogoutSplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function signOutAndRedirect() {
      await useAuthStore.getState().logout();
      await new Promise((resolve) => setTimeout(resolve, SPLASH_DURATION_MS));
      if (!cancelled) {
        navigate("/login", { replace: true });
      }
    }

    signOutAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#044b3b] flex flex-col items-center justify-center px-6 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-8 shadow-lg shadow-black/10">
          <span className="font-bold text-3xl tracking-tight">T</span>
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60 mb-3">
          TravioAfrica
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Signing you out</h1>

        <p className="text-sm sm:text-base text-white/75 max-w-sm mb-8">
          Thanks for using the supplier dashboard. Redirecting you to sign in…
        </p>

        <div className="flex items-center gap-3 text-white/80">
          <Loader2 size={22} className="animate-spin" />
          <LogOut size={18} className="opacity-80" />
        </div>
      </div>
    </div>
  );
}
