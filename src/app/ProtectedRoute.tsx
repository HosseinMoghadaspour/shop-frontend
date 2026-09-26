import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";

export function ProtectedRoute() {
  const location =
    useLocation();

  const isAuthenticated =
    useAuthStore(
      (state) =>
        state.isAuthenticated,
    );

  const isInitialized =
    useAuthStore(
      (state) =>
        state.isInitialized,
    );

  if (!isInitialized) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo =
      `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  return <Outlet />;
}
