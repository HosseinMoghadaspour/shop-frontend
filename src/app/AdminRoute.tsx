import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";

export function AdminRoute() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authKind = useAuthStore((state) => state.authKind);

  if (!isInitialized) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#f5f8f6] p-5" role="status" aria-label="در حال بررسی دسترسی مدیریت">
        <Skeleton className="mb-5 h-14 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[270px_1fr]">
          <Skeleton className="hidden min-h-[70vh] rounded-2xl lg:block" />
          <div className="space-y-5">
            <Skeleton className="h-10 w-1/3 rounded-xl" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || authKind !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
