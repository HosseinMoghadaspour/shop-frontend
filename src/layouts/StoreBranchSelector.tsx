import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  MapPinned,
  LoaderCircle,
  RefreshCw,
  CheckCircle2,
  Truck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

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
    if (!isInitialized || !isAuthenticated || !addressesQuery.isSuccess) {
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
      addressesQuery.data?.find((address) => address.id === addressId) ?? null
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
        selectedAddress?.latitude != null && selectedAddress.longitude != null
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
        branches[0]?.id ??
        null;

      setSelectedBranchId(preferredBranch);
      if (preferredBranch !== null) refreshBranchData();
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
  function handleAddressChange(value: string | null) {
    if (!value) return;

    const nextAddressId = Number(value);

    if (!Number.isSafeInteger(nextAddressId) || nextAddressId <= 0) {
      return;
    }

    setAddressId(nextAddressId);

    setSelectedAddressId(nextAddressId);

    setSelectedBranchId(null);

    refreshBranchData();
  }

  function handleBranchChange(value: string | null) {
    if (!value) return;

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
      <Card dir="rtl" className="border-border/60 shadow-sm">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LoaderCircle className="size-5 animate-spin" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">در حال بررسی آدرس شما</p>
            <p className="text-xs text-muted-foreground">
              لطفاً کمی صبر کنید...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (addressesQuery.isError) {
    return (
      <Card dir="rtl" className="border-destructive/20 shadow-sm">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <p className="text-sm text-destructive">دریافت آدرس‌ها ناموفق بود.</p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void addressesQuery.refetch()}
          >
            <RefreshCw className="size-4" />
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!selectedAddress) {
    return null;
  }

  const branches = branchesQuery.data?.data ?? [];

  const selectedBranch = branches.find((branch) => branch.id === branchId);

  return (
    <Card
      dir="rtl"
      className="overflow-hidden border-border/60 bg-background shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      {/* هدر */}
      <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Truck className="size-5" />
          </div>

          <div>
            <p className="text-sm font-bold">محل ارسال و شعبه خرید</p>

            <p className="text-xs text-muted-foreground">
              آدرس و شعبه موردنظر خود را انتخاب کنید
            </p>
          </div>
        </div>

        {selectedBranch && (
          <Badge
            variant="secondary"
            className="hidden gap-1.5 border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400 sm:flex"
          >
            <CheckCircle2 className="size-3.5" />
            شعبه فعال
          </Badge>
        )}
      </div>

      <CardContent className="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* آدرس */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <MapPin className="size-4" />
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  ارسال به
                </p>

                <p className="text-sm font-semibold">آدرس تحویل</p>
              </div>
            </div>

            <Select
              value={addressId?.toString() ?? ""}
              onValueChange={handleAddressChange}
            >
              <SelectTrigger className="h-11 w-full rounded-xl bg-background">
                <SelectValue placeholder="انتخاب آدرس" />
              </SelectTrigger>

              <SelectContent>
                {(addressesQuery.data ?? []).map((address) => (
                  <SelectItem key={address.id} value={address.id.toString()}>
                    {address.city?.name ?? "شهر نامشخص"} -{" "}
                    {address.address?.slice(0, 35) ?? "آدرس"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* شعبه */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <MapPinned className="size-4" />
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  شعبه خرید
                </p>

                <p className="text-sm font-semibold">انتخاب شعبه</p>
              </div>
            </div>

            {branchesQuery.isLoading ? (
              <div className="flex h-11 items-center gap-2 rounded-xl border bg-muted/30 px-3 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                در حال دریافت شعب...
              </div>
            ) : branchesQuery.isError ? (
              <Button
                variant="outline"
                className="h-11 w-full justify-between rounded-xl text-destructive"
                onClick={() => void branchesQuery.refetch()}
              >
                دریافت شعب ناموفق بود
                <RefreshCw className="size-4" />
              </Button>
            ) : branches.length === 0 ? (
              <div className="flex h-11 items-center rounded-xl border border-destructive/20 bg-destructive/5 px-3 text-sm text-destructive">
                شعبه‌ای در این شهر یافت نشد
              </div>
            ) : (
              <Select
                value={branchId?.toString() ?? ""}
                onValueChange={handleBranchChange}
              >
                <SelectTrigger className="h-11 w-full rounded-xl bg-background">
                  <SelectValue placeholder="انتخاب شعبه" />
                </SelectTrigger>

                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                      {branch.isDefault ? " (پیشنهادی)" : ""}
                      {branch.distanceKm != null
                        ? ` - ${branch.distanceKm} کیلومتر`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* وضعیت انتخاب */}
        {selectedBranch && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-200/70 bg-green-50/70 p-3 dark:border-green-900/60 dark:bg-green-950/30">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                {selectedBranch.name}
              </p>

              <p className="mt-1 text-xs text-green-700/80 dark:text-green-400/80">
                کالاهای فروشگاه براساس این شعبه نمایش داده می‌شوند.
              </p>
            </div>

            {selectedBranch.distanceKm != null && (
              <Badge
                variant="outline"
                className="shrink-0 border-green-200 text-green-700 dark:border-green-900 dark:text-green-400"
              >
                {selectedBranch.distanceKm} کیلومتر
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
