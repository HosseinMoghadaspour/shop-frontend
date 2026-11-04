import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Store } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { getMyAddresses } from "@/services/addresses.api";
import { getBranchesByCity } from "@/services/branches.api";
import { getSelectedAddressId, getSelectedBranchId, setSelectedAddressId, setSelectedBranchId } from "@/lib/store-branch";

export function StoreBranchSelector() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const refreshCart = useCartStore((state) => state.fetchCart);
  const [addressId, setAddressId] = useState<number | undefined>(getSelectedAddressId());
  const [branchId, setBranchId] = useState<number | undefined>(getSelectedBranchId());

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: getMyAddresses,
    enabled: isAuthenticated,
  });

  const addresses = useMemo(
    () => (addressesQuery.data ?? []).filter((item) => item.isActive && item.cityId),
    [addressesQuery.data],
  );
  const selectedAddress = addresses.find((item) => item.id === addressId) ?? addresses[0];
  const cityId = selectedAddress?.cityId ?? undefined;

  const branchesQuery = useQuery({
    queryKey: ["store-branches", cityId],
    queryFn: () => getBranchesByCity(cityId!),
    enabled: isAuthenticated && cityId !== undefined,
  });

  useEffect(() => {
    if (!addresses.length) return;
    const exists = addresses.some((item) => item.id === addressId);
    if (!exists) {
      const firstAddress = addresses[0];
      setAddressId(firstAddress.id);
      setSelectedAddressId(firstAddress.id);
    }
  }, [addresses, addressId]);

  useEffect(() => {
    if (!branchesQuery.data) return;
    const branches = branchesQuery.data.data;
    if (!branches.length) {
      setBranchId(undefined);
      setSelectedBranchId(null);
      return;
    }
    const exists = branches.some((item) => item.id === branchId);
    if (!exists) {
      const preferred = branchesQuery.data?.defaultBranchId ?? branches[0].id;
      setBranchId(preferred);
      setSelectedBranchId(preferred);
    }
  }, [branchesQuery.data, branchId]);

  function refreshBranchDependentData() {
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["product"] });
    void queryClient.invalidateQueries({ queryKey: ["cart"] });
    window.dispatchEvent(new Event("store-branch-change"));
    void refreshCart();
  }

  if (!isAuthenticated) return null;

  if (addressesQuery.isLoading) {
    return <div className="h-9 w-40 animate-pulse rounded-xl bg-white/60" />;
  }

  if (!addresses.length) {
    return (
      <Link to="/checkout" className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm">
        <MapPin className="size-4" />
        ابتدا آدرس تحویل را ثبت کنید
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2" dir="rtl">
      <div className="flex min-w-0 items-center gap-2">
        <MapPin className="size-4 shrink-0 text-emerald-800" />
        <Select
          value={selectedAddress ? String(selectedAddress.id) : ""}
          onValueChange={(value) => {
            const nextId = Number(value);
            setAddressId(nextId);
            setSelectedAddressId(nextId);
            setBranchId(undefined);
            setSelectedBranchId(null);
            refreshBranchDependentData();
          }}
        >
          <SelectTrigger className="h-9 w-[150px] border-emerald-900/10 bg-white text-xs sm:w-[190px]">
            <SelectValue placeholder="آدرس تحویل" />
          </SelectTrigger>
          <SelectContent>
            {addresses.map((address) => (
              <SelectItem key={address.id} value={String(address.id)}>
                {address.city?.name ?? "شهر نامشخص"} - {address.recipient.name ?? "آدرس"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <Store className="size-4 shrink-0 text-emerald-800" />
        <Select
          value={branchId ? String(branchId) : ""}
          onValueChange={(value) => {
            const nextId = Number(value);
            setBranchId(nextId);
            setSelectedBranchId(nextId);
            refreshBranchDependentData();
          }}
          disabled={branchesQuery.isLoading || !branchesQuery.data?.data.length}
        >
          <SelectTrigger className="h-9 w-[145px] border-emerald-900/10 bg-white text-xs sm:w-[180px]">
            <SelectValue placeholder={branchesQuery.isLoading ? "دریافت شعب..." : "انتخاب شعبه"} />
          </SelectTrigger>
          <SelectContent>
            {branchesQuery.data?.data.map((branch) => (
              <SelectItem key={branch.id} value={String(branch.id)}>
                {branch.name}{branch.isDefault ? " (پیشنهادی)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {branchesQuery.data?.data.length === 0 && (
        <span className="text-xs text-rose-700">برای این شهر هنوز شعبه فروشگاهی تعریف نشده است.</span>
      )}
    </div>
  );
}
