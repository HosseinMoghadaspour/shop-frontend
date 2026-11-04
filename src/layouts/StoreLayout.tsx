import { Header } from "@/components/layout/Header";
import { StoreBranchBar } from "@/components/layout/StoreBranchBar";
import { Footer } from "@/components/layout/Footer";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { getMyAddresses } from "@/services/addresses.api";

export function StoreLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
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
    <div className="flex min-h-screen flex-col text-foreground bg-[#EDF7F3]">
      <Header />
      <StoreBranchBar />
      <main className="mx-auto w-full max-w-[1000px] flex-1 p-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
