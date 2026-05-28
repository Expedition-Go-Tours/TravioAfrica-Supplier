import { useEffect } from "react";
import Providers from "./providers";
import AppRoutes from "./routes";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { initAuthFromStorage, useAuthStore } from "@/stores/authStore";

function App() {
  // Hydrate auth state from localStorage on first mount so the user
  // isn't treated as logged-out while the cookie is being verified.
  useEffect(() => {
    initAuthFromStorage();

    const finishHydration = () => {
      useAuthStore.getState().setHasHydrated(true);
    };

    if (useAuthStore.persist.hasHydrated()) {
      finishHydration();
      return undefined;
    }

    return useAuthStore.persist.onFinishHydration(finishHydration);
  }, []);

  return (
    <ErrorBoundary>
      <Providers>
        <AppRoutes />
      </Providers>
    </ErrorBoundary>
  );
}

export default App;
