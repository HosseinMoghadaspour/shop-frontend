import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { getMyAddresses } from "@/services/addresses.api";
import { useSelectedBranchId } from "@/hooks/useSelectedBranchId";
import { Skeleton } from "@/components/ui/skeleton";

export function StoreLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const branchId = useSelectedBranchId();
  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: getMyAddresses,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated || !addressesQuery.isSuccess) return;
    if (addressesQuery.data.length === 0 && location.pathname !== "/delivery-address") {
      navigate("/delivery-address", { replace: true });
    }
  }, [isAuthenticated, addressesQuery.isSuccess, addressesQuery.data, location.pathname, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-[#EDF7F3] pb-[calc(5.25rem+env(safe-area-inset-bottom))] text-foreground md:pb-0">
      <Header />
      <main className="mx-auto w-full max-w-[1000px] flex-1 p-5">
        {isAuthenticated && location.pathname !== "/delivery-address" && addressesQuery.isLoading ? (
          <div dir="rtl" className="space-y-5 py-4" role="status" aria-label="در حال بارگذاری اطلاعات حساب">
            <Skeleton className="h-12 w-2/3 rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-36 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : isAuthenticated && location.pathname !== "/delivery-address" && addressesQuery.isError ? (
          <div dir="rtl" className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-800">
            بررسی آدرس‌های حساب کاربری با خطا مواجه شد. لطفاً صفحه را دوباره بارگذاری کنید.
          </div>
        ) : isAuthenticated && location.pathname !== "/delivery-address" && addressesQuery.data?.length && !branchId ? (
          <div dir="rtl" className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-900">
            برای مشاهده کالاها ابتدا از نوار بالای صفحه یک شعبه فعال انتخاب کنید.
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
    </div>
  );
}
