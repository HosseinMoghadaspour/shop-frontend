import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { PageLoader } from "@/components/ui/PageLoader";
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
      <PageLoader label="در حال بررسی وضعیت ورود..." />
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
