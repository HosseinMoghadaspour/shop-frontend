import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { PageLoader } from "@/components/ui/PageLoader";

export function AdminRoute() {
  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  const authKind = useAuthStore(
    (state) => state.authKind,
  );

  if (!isInitialized) {
    return (
      <PageLoader label="در حال بررسی دسترسی مدیریت..." />
    );
  }

  if (!isAuthenticated || authKind !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
