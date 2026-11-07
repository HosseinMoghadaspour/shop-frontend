import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  MapPinned,
  ChevronDown,
  LoaderCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";

import { getMyAddresses } from "@/services/addresses.api";
import { getBranchesByCity } from "@/services/branches.api";

import {
  getSelectedAddressId,
  setSelectedAddressId,
  setSelectedBranchId,
} from "@/lib/store-branch";

import { useSelectedBranchId } from "@/hooks/useSelectedBranchId";

export function StoreBranchSelector() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const branchId = useSelectedBranchId();

  const location = useLocation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const refreshCart = useCartStore((state) => state.fetchCart);

  const [addressId, setAddressId] = useState<number | undefined>(
    getSelectedAddressId,
  );

  // بروزرسانی اطلاعات وابسته به شعبه
  const refreshBranchData = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["products"],
    });

    void queryClient.invalidateQueries({
      queryKey: ["product"],
    });

    void queryClient.invalidateQueries({
      queryKey: ["cart"],
    });

    void refreshCart();
  }, [queryClient, refreshCart]);

  // هماهنگی آدرس انتخاب شده
  useEffect(() => {
    const syncAddress = () => {
      setAddressId(getSelectedAddressId());
    };

    window.addEventListener("store-address-change", syncAddress);
    window.addEventListener("storage", syncAddress);

    return () => {
      window.removeEventListener("store-address-change", syncAddress);
      window.removeEventListener("storage", syncAddress);
    };
  }, []);

  // دریافت آدرس‌های مشتری
  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: getMyAddresses,
    enabled: isInitialized && isAuthenticated,
  });

  // بررسی وجود آدرس و انتخاب آدرس پیش‌فرض
  useEffect(() => {
    if (
      !isInitialized ||
      !isAuthenticated ||
      !addressesQuery.isSuccess
    ) {
      return;
    }

    const addresses = addressesQuery.data ?? [];

    if (addresses.length === 0) {
      if (location.pathname !== "/delivery-address") {
        navigate("/delivery-address", {
          replace: true,
        });
      }

      return;
    }

    const currentAddress = addresses.find(
      (address) => address.id === addressId,
    );

    if (!currentAddress && addressesQuery.isFetching) {
      return;
    }

    if (!currentAddress) {
      const preferredAddress = addresses[0];

      setAddressId(preferredAddress.id);

      setSelectedAddressId(preferredAddress.id);
      setSelectedBranchId(null);
    }
  }, [
    isInitialized,
    isAuthenticated,
    addressesQuery.isSuccess,
    addressesQuery.isFetching,
    addressesQuery.data,
    addressId,
    location.pathname,
    navigate,
  ]);

  // آدرس انتخاب شده
  const selectedAddress = useMemo(() => {
    return (
      addressesQuery.data?.find(
        (address) => address.id === addressId,
      ) ?? null
    );
  }, [addressesQuery.data, addressId]);

  const cityId = selectedAddress?.cityId ?? undefined;

  // دریافت شعب فعال شهر
  const branchesQuery = useQuery({
    queryKey: [
      "store-branches",
      cityId,
      selectedAddress?.latitude,
      selectedAddress?.longitude,
    ],

    queryFn: () =>
      getBranchesByCity(
        cityId!,
        selectedAddress?.latitude != null &&
          selectedAddress.longitude != null
          ? {
              latitude: selectedAddress.latitude,
              longitude: selectedAddress.longitude,
            }
          : undefined,
      ),

    enabled: isAuthenticated && cityId !== undefined,
  });

  // انتخاب خودکار شعبه پیش‌فرض یا نزدیک‌ترین شعبه
  useEffect(() => {
    if (!branchesQuery.isSuccess || !branchesQuery.data) {
      return;
    }

    const branches = branchesQuery.data.data;

    const selectedBranchExists = branches.some(
      (branch) => branch.id === branchId,
    );

    if (!selectedBranchExists) {
      const preferredBranch =
        branchesQuery.data.defaultBranchId ??
        (
          selectedAddress?.latitude != null &&
          selectedAddress.longitude != null &&
          branches[0]?.distanceKm != null
            ? branches[0].id
            : null
        );

      setSelectedBranchId(preferredBranch);

      refreshBranchData();
    }
  }, [
    branchesQuery.isSuccess,
    branchesQuery.data,
    branchId,
    selectedAddress?.latitude,
    selectedAddress?.longitude,
    refreshBranchData,
  ]);

  // انتخاب آدرس جدید
  function handleAddressChange(value: string) {
    const nextAddressId = Number(value);

    if (!Number.isSafeInteger(nextAddressId) || nextAddressId <= 0) {
      return;
    }

    setAddressId(nextAddressId);

    setSelectedAddressId(nextAddressId);

    // شعبه قبلی برای شهر جدید معتبر نیست
    setSelectedBranchId(null);

    refreshBranchData();
  }

  // انتخاب شعبه جدید
  function handleBranchChange(value: string) {
    const nextBranchId = Number(value);

    if (!Number.isSafeInteger(nextBranchId) || nextBranchId <= 0) {
      return;
    }

    setSelectedBranchId(nextBranchId);

    refreshBranchData();
  }

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  if (location.pathname === "/delivery-address") {
    return null;
  }

  if (addressesQuery.isPending || addressesQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-900">
        <LoaderCircle className="size-4 animate-spin" />
        در حال بررسی آدرس شما...
      </div>
    );
  }

  if (addressesQuery.isError) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-600">
        دریافت آدرس‌ها ناموفق بود.
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void addressesQuery.refetch()}
        >
          <RefreshCw className="size-3.5" />
          تلاش مجدد
        </Button>
      </div>
    );
  }

  if (!selectedAddress) {
    return null;
  }

  const branches = branchesQuery.data?.data ?? [];

  const selectedBranch = branches.find(
    (branch) => branch.id === branchId,
  );

  return (
    <div
      dir="rtl"
      className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3"
    >
      {/* انتخاب آدرس */}
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/70 text-emerald-800">
          <MapPin className="size-5" />
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="text-[10px] text-emerald-950/60">
            ارسال به
          </span>

          <select
            aria-label="انتخاب آدرس تحویل"
            value={addressId ?? ""}
            onChange={(event) =>
              handleAddressChange(event.target.value)
            }
            className="max-w-[155px] cursor-pointer truncate border-0 bg-transparent text-xs font-bold text-emerald-950 outline-none sm:max-w-[190px]"
          >
            {(addressesQuery.data ?? []).map((address) => (
              <option key={address.id} value={address.id}>
                {address.city?.name ?? "شهر نامشخص"} -{" "}
                {address.address?.slice(0, 25) ?? "آدرس"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hidden h-8 w-px bg-emerald-900/15 sm:block" />

      {/* انتخاب شعبه */}
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/70 text-emerald-800">
          <MapPinned className="size-5" />
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="text-[10px] text-emerald-950/60">
            شعبه خرید
          </span>

          {branchesQuery.isLoading ? (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-800">
              <LoaderCircle className="size-3 animate-spin" />
              دریافت شعب...
            </span>
          ) : branchesQuery.isError ? (
            <button
              type="button"
              onClick={() => void branchesQuery.refetch()}
              className="text-xs font-semibold text-red-600"
            >
              تلاش مجدد
            </button>
          ) : branches.length === 0 ? (
            <span className="text-xs text-red-600">
              شعبه‌ای یافت نشد
            </span>
          ) : (
            <select
              aria-label="انتخاب شعبه خرید"
              value={branchId ?? ""}
              onChange={(event) =>
                handleBranchChange(event.target.value)
              }
              className="max-w-[150px] cursor-pointer truncate border-0 bg-transparent text-xs font-bold text-emerald-950 outline-none sm:max-w-[180px]"
            >
              {!selectedBranch && (
                <option value="" disabled>
                  انتخاب شعبه
                </option>
              )}

              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                  {branch.isDefault ? " (پیشنهادی)" : ""}
                  {branch.distanceKm != null
                    ? ` - ${branch.distanceKm} کیلومتر`
                    : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedBranch && (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-700" />
        )}
      </div>

      {/* مدیریت آدرس */}
      <Link
        to="/delivery-address"
        className="mr-auto flex shrink-0 items-center gap-1 rounded-lg bg-white/60 px-2.5 py-2 text-[11px] font-semibold text-emerald-900 transition hover:bg-white sm:mr-0"
      >
        مدیریت آدرس‌ها
        <ChevronDown className="size-3" />
      </Link>
    </div>
  );
}
