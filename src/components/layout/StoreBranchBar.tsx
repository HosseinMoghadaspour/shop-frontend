import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { getMyAddresses } from "@/services/addresses.api";
import { getBranchesByCity } from "@/services/branches.api";
import {
  getSelectedAddressId,
  setSelectedAddressId,
  setSelectedBranchId,
} from "@/lib/store-branch";
import { useSelectedBranchId } from "@/hooks/useSelectedBranchId";
import { useCartStore } from "@/stores/cart.store";

export function StoreBranchBar() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();
  const branchId = useSelectedBranchId();
  const queryClient = useQueryClient();
  const refreshCart = useCartStore((state) => state.fetchCart);

  function refreshBranchData() {
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["product"] });
    void queryClient.invalidateQueries({ queryKey: ["cart"] });
    void refreshCart();
  }
  const [addressId, setAddressId] = useState<number | undefined>(getSelectedAddressId());

  useEffect(() => {
    const syncAddress = () => setAddressId(getSelectedAddressId());
    window.addEventListener("store-address-change", syncAddress);
    window.addEventListener("storage", syncAddress);
    return () => {
      window.removeEventListener("store-address-change", syncAddress);
      window.removeEventListener("storage", syncAddress);
    };
  }, []);

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: getMyAddresses,
    enabled: isInitialized && isAuthenticated,
  });

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !addressesQuery.isSuccess) return;

    const addresses = addressesQuery.data ?? [];
    if (addresses.length === 0) {
      if (location.pathname !== "/delivery-address") navigate("/delivery-address", { replace: true });
      return;
    }

    const current = addresses.find((address) => address.id === addressId);
    if (!current && addressesQuery.isFetching) return;
    if (!current) {
      const preferred = addresses[0];
      setAddressId(preferred.id);
      setSelectedAddressId(preferred.id);
      setSelectedBranchId(null);
    }
  }, [isInitialized, isAuthenticated, addressesQuery.isSuccess, addressesQuery.isFetching, addressesQuery.data, addressId, location.pathname, navigate]);

  const selectedAddress = useMemo(
    () => addressesQuery.data?.find((address) => address.id === addressId) ?? null,
    [addressesQuery.data, addressId],
  );

  const cityId = selectedAddress?.cityId ?? undefined;
  const branchesQuery = useQuery({
    queryKey: ["store-branches", cityId, selectedAddress?.latitude, selectedAddress?.longitude],
    queryFn: () => getBranchesByCity(
      cityId!,
      selectedAddress?.latitude != null && selectedAddress.longitude != null
        ? { latitude: selectedAddress.latitude, longitude: selectedAddress.longitude }
        : undefined,
    ),
    enabled: isAuthenticated && cityId !== undefined,
  });

  useEffect(() => {
    if (!branchesQuery.isSuccess || !branchesQuery.data) return;
    const branches = branchesQuery.data.data;
    if (!branches.some((branch) => branch.id === branchId)) {
      const preferred = branchesQuery.data.defaultBranchId ?? (selectedAddress?.latitude != null && selectedAddress.longitude != null ? branches[0]?.id ?? null : null);
      setSelectedBranchId(preferred);
      refreshBranchData();
    }
  }, [branchesQuery.isSuccess, branchesQuery.data, branchId, selectedAddress?.latitude, selectedAddress?.longitude]);

  if (!isInitialized || !isAuthenticated) return null;
  if (location.pathname === "/delivery-address" && addressesQuery.data?.length === 0) return null;
  if (addressesQuery.isLoading || addressesQuery.isPending) {
    return <div className="h-10 border-b bg-white/80" />;
  }
  if (addressesQuery.isError) {
    return (
      <div dir="rtl" className="border-b bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
        دریافت آدرس‌های شما انجام نشد. لطفاً صفحه را تازه‌سازی کنید.
      </div>
    );
  }
  if (!selectedAddress) return null;

  return (
    <div dir="rtl" className="border-b border-emerald-900/10 bg-white/90">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <MapPin className="size-4 text-emerald-700" />
          <span>تحویل به:</span>
        </div>
        <select
          aria-label="انتخاب آدرس تحویل"
          className="max-w-[220px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
          value={addressId ?? ""}
          onChange={(event) => {
            const nextId = Number(event.target.value);
            setAddressId(nextId);
            setSelectedAddressId(nextId);
            setSelectedBranchId(null);
            refreshBranchData();
          }}
        >
          {(addressesQuery.data ?? []).map((address) => (
            <option key={address.id} value={address.id}>
              {address.city?.name ?? "شهر نامشخص"} - {address.address?.slice(0, 35) ?? "آدرس"}
            </option>
          ))}
        </select>
        <span className="text-xs font-semibold text-slate-600">شعبه خرید:</span>
        <select
          aria-label="انتخاب شعبه خرید"
          className="max-w-[220px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
          value={branchId ?? ""}
          disabled={branchesQuery.isLoading || !branchesQuery.data?.data.length}
          onChange={(event) => { setSelectedBranchId(Number(event.target.value)); refreshBranchData(); }}
        >
          <option value="" disabled>
            {branchesQuery.isLoading ? "در حال دریافت شعب..." : "انتخاب شعبه"}
          </option>
          {(branchesQuery.data?.data ?? []).map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}{branch.isDefault ? " (پیشنهادی)" : ""}
            </option>
          ))}
        </select>
        <Link to="/delivery-address" className="mr-auto text-xs font-medium text-emerald-700 hover:underline">
          مدیریت آدرس‌ها
        </Link>
        {branchesQuery.isSuccess && branchesQuery.data.data.length === 0 && (
          <span className="w-full text-xs text-rose-700">برای شهر این آدرس هنوز شعبه فعالی تعریف نشده است.</span>
        )}
      </div>
    </div>
  );
}
