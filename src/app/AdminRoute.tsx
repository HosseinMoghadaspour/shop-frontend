import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!isAuthenticated || authKind !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
