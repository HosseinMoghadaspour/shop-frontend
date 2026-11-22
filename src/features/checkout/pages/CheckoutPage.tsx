import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddressSelector from "../components/AddressSelector";
import { useAddresses } from "@/features/addresses/hooks/useAddresses";
import LocationSelector from "../components/LocationSelector";
import { useCart } from "@/features/cart/hooks/useCart";
import { getMyProfile, updateMyProfile, type CustomerProfile } from "@/services/profile.api";
import { createOrder } from "@/services/orders.api";
import type { OrderDeliveryAddress } from "@/services/orders.api";
import { getPaymentMethods } from "@/services/payment.api";
import { getBranchesByCity } from "@/services/branches.api";
import {
  getSelectedAddressId,
  getSelectedBranchId,
  setSelectedAddressId,
  setSelectedBranchId,
} from "@/lib/store-branch";
import type { PaymentMethod } from "@/services/payment.api";

type ReceiverType = "self" | "other";
type ProfileForm = { fullName: string; phoneNumber: string; email: string; nationalCode: string };

interface CartItem {
  goodId: number | string;
  rowName: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function CheckoutPage() {
  const navigate = useNavigate();

  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { data: profile, isLoading: profileLoading } = useQuery({ queryKey: ["my-profile"], queryFn: getMyProfile, staleTime: 5 * 60 * 1000 });

  const [selectedAddressId, setSelectedAddressIdState] = useState<number | null>(getSelectedAddressId() ?? null);
  const [selectedBranchId, setSelectedBranchIdState] = useState<number | undefined>(getSelectedBranchId());
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    number | null
  >(null);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);

  const [receiverType, setReceiverType] = useState<ReceiverType>("self");
  const [profileForm, setProfileForm] = useState<ProfileForm>({ fullName: "", phoneNumber: "", email: "", nationalCode: "" });

  const [form, setForm] = useState<OrderDeliveryAddress>({
    cityId: 0,
    deliverToName: "",
    deliverToMobileNumber: "",
    deliverToPhoneNumber: "",
    Adrs: "",
    PostalCode: "",
    RowDesc: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setProfileForm({
      fullName: profile.fullName || "",
      phoneNumber: profile.phoneNumber || "",
      email: profile.email || "",
      nationalCode: profile.nationalCode || "",
    });
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    async function loadPaymentMethods() {
      try {
        const methods = await getPaymentMethods();
        if (cancelled) return;
        setPaymentMethods(methods);
        setSelectedPaymentMethodId(
          (current) => current ?? methods[0]?.rowId ?? null,
        );
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : "دریافت روش‌های پرداخت انجام نشد.",
          );
      } finally {
        if (!cancelled) setPaymentMethodsLoading(false);
      }
    }
    void loadPaymentMethods();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedAddress = useMemo(() => {
    if (!selectedAddressId || !addresses) {
      return null;
    }

    return (
      addresses.find((address) => address.id === selectedAddressId) ?? null
    );
  }, [addresses, selectedAddressId]);

  const selectableAddresses = useMemo(() => {
    if (receiverType !== "self" || !addresses) return [];
    const mobile = (profile?.mobile ?? "").replace(/\D/g, "");
    return addresses.filter((address) =>
      mobile && (address.recipient.mobile ?? "").replace(/\D/g, "") === mobile,
    );
  }, [receiverType, addresses, profile?.mobile]);

  const branchCityId =
    selectedAddress?.cityId ??
    (selectedAddressId === null && form.cityId > 0 ? form.cityId : undefined);

  const branchesQuery = useQuery({
    queryKey: ["store-branches", branchCityId, selectedAddress?.latitude, selectedAddress?.longitude],
    queryFn: () => getBranchesByCity(branchCityId!, selectedAddress?.latitude != null && selectedAddress.longitude != null ? { latitude: selectedAddress.latitude, longitude: selectedAddress.longitude } : undefined),
    enabled: branchCityId !== undefined,
  });

  useEffect(() => {
    const syncAddress = () => setSelectedAddressIdState(getSelectedAddressId() ?? null);
    window.addEventListener("store-address-change", syncAddress);
    return () => window.removeEventListener("store-address-change", syncAddress);
  }, []);

  useEffect(() => {
    const syncBranch = () => setSelectedBranchIdState(getSelectedBranchId());
    const syncAddress = () => setSelectedAddressIdState(getSelectedAddressId() ?? null);
    window.addEventListener("store-branch-change", syncBranch);
    window.addEventListener("store-address-change", syncAddress);
    return () => {
      window.removeEventListener("store-branch-change", syncBranch);
      window.removeEventListener("store-address-change", syncAddress);
    };
  }, []);

  useEffect(() => {
    if (!branchCityId || !branchesQuery.data) return;
    const branches = branchesQuery.data.data;
    if (!branches.length) {
      setSelectedBranchIdState(undefined);
      setSelectedBranchId(null);
      return;
    }
    if (!branches.some((branch) => branch.id === selectedBranchId)) {
      const preferred = branchesQuery.data.defaultBranchId ?? (selectedAddress?.latitude != null && selectedAddress.longitude != null && branches[0]?.distanceKm != null ? branches[0].id : undefined);
      setSelectedBranchIdState(preferred);
      setSelectedBranchId(preferred ?? null);
    }
  }, [branchCityId, branchesQuery.data, selectedBranchId]);

  const handleSelectAddress = (
    address: NonNullable<typeof addresses>[number],
  ) => {
    setSelectedAddressIdState(address.id);
    setSelectedAddressId(address.id);
    setSelectedBranchIdState(undefined);
    setSelectedBranchId(null);
    setError(null);

    setProvinceId(address.province?.id ?? null);

    setForm({
      cityId: address.cityId ?? 0,
      deliverToName: address.recipient.name ?? "",
      deliverToMobileNumber: address.recipient.mobile ?? "",
      deliverToPhoneNumber: address.recipient.phone ?? "",
      Adrs: address.address ?? "",
      PostalCode: address.postalCode ?? "",
      RowDesc: "",
    });
  };

  const handleNewAddress = () => {
    setSelectedAddressIdState(null);
    setSelectedAddressId(null);
    setSelectedBranchIdState(undefined);
    setSelectedBranchId(null);
    setProvinceId(null);
    setError(null);
    setForm({
      cityId: 0,
      deliverToName: receiverType === "self" ? profileForm.fullName : "",
      deliverToMobileNumber: receiverType === "self" ? profile?.mobile ?? "" : "",
      deliverToPhoneNumber: receiverType === "self" ? profileForm.phoneNumber : "",
      Adrs: "",
      PostalCode: "",
      RowDesc: "",
    });
  };

  const handleReceiverTypeChange = (nextType: ReceiverType) => {
    setReceiverType(nextType);
    setSelectedAddressIdState(null);
    setSelectedAddressId(null);
    setSelectedBranchIdState(undefined);
    setSelectedBranchId(null);
    setProvinceId(null);
    setError(null);
    setForm({
      cityId: 0,
      deliverToName: nextType === "self" ? profileForm.fullName : "",
      deliverToMobileNumber: nextType === "self" ? profile?.mobile ?? "" : "",
      deliverToPhoneNumber: nextType === "self" ? profileForm.phoneNumber : "",
      Adrs: "",
      PostalCode: "",
      RowDesc: "",
    });
  };

  const handleEditSelectedAddress = () => {
    if (!selectedAddress) return;
    setProvinceId(selectedAddress.province?.id ?? null);
    setForm({
      cityId: selectedAddress.cityId ?? 0,
      deliverToName: selectedAddress.recipient.name ?? "",
      deliverToMobileNumber: selectedAddress.recipient.mobile ?? "",
      deliverToPhoneNumber: selectedAddress.recipient.phone ?? "",
      Adrs: selectedAddress.address ?? "",
      PostalCode: selectedAddress.postalCode ?? "",
      RowDesc: "",
    });
    setSelectedAddressIdState(null);
    setSelectedAddressId(null);
  };

  useEffect(() => {
    if (receiverType !== "self" || !profile || addressesLoading || !addresses) return;
    const mobile = (profile.mobile ?? "").replace(/\D/g, "");
    if (!mobile) return;
    const ownAddress = addresses.find((address) =>
      (address.recipient.mobile ?? "").replace(/\D/g, "") === mobile,
    );
    if (selectedAddressId !== null) {
      const selected = addresses.find((address) => address.id === selectedAddressId);
      if (selected && (selected.recipient.mobile ?? "").replace(/\D/g, "") !== mobile) {
        setSelectedAddressIdState(null);
        setSelectedAddressId(null);
      } else {
        return;
      }
    }
    if (ownAddress) {
      handleSelectAddress(ownAddress);
    } else {
      setForm((current) => ({
        ...current,
        deliverToName: profileForm.fullName,
        deliverToMobileNumber: profile.mobile ?? "",
        deliverToPhoneNumber: profileForm.phoneNumber,
      }));
    }
  }, [receiverType, profile, profileForm.fullName, profileForm.phoneNumber, addresses, addressesLoading, selectedAddressId]);

  const handleChange = (
    field: keyof OrderDeliveryAddress,
    value: string | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (selectedAddressId !== null) {
      setSelectedAddressIdState(null);
      setSelectedAddressId(null);
      setSelectedBranchIdState(undefined);
      setSelectedBranchId(null);
      setProvinceId(null);
    }
  };

  const handleProvinceChange = (value: number | null) => {
    setProvinceId(value);
    setSelectedBranchIdState(undefined);
    setSelectedBranchId(null);
    setForm((prev) => ({
      ...prev,
      cityId: 0,
    }));
  };

  const handleCityChange = (value: number | null) => {
    setSelectedBranchIdState(undefined);
    setSelectedBranchId(null);
    setForm((prev) => ({
      ...prev,
      cityId: value ?? 0,
    }));
  };

  const handleSubmitOrder = async () => {
    setError(null);

    if (profileLoading) {
      setError("لطفاً تا دریافت اطلاعات حساب کاربری صبر کنید.");
      return;
    }
    if (!profile?.mobile) {
      setError("شماره موبایل حساب کاربری معتبر نیست؛ لطفاً دوباره وارد شوید.");
      return;
    }
    if (!profileForm.fullName.trim()) {
      setError("لطفاً نام و نام خانوادگی خود را در اطلاعات حساب وارد کنید.");
      return;
    }

    if (!selectedBranchId) {
      setError("برای شهر این آدرس شعبه فعالی انتخاب نشده است.");
      return;
    }

    if (cartLoading) {
      return;
    }
    if (paymentMethodsLoading) {
      setError("لطفاً تا دریافت روش‌های پرداخت صبر کنید.");
      return;
    }
    if (!selectedPaymentMethodId) {
      setError("لطفاً روش پرداخت را انتخاب کنید.");
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      setError("سبد خرید شما خالی است.");
      return;
    }

    const profileHasChanged = Boolean(
      profile &&
      (
        profileForm.fullName.trim() !== profile.fullName.trim() ||
        profileForm.phoneNumber.trim() !== profile.phoneNumber.trim()
      ),
    );
    const orderAddressId =
      receiverType === "self" && selectedAddressId !== null && profileHasChanged
        ? null
        : selectedAddressId;
    const deliveryForm =
      receiverType === "self" && orderAddressId === null && selectedAddressId !== null
        ? {
            ...form,
            deliverToName: profileForm.fullName.trim(),
            deliverToMobileNumber: profile.mobile ?? form.deliverToMobileNumber,
            deliverToPhoneNumber: profileForm.phoneNumber.trim(),
          }
        : form;

    if (orderAddressId === null) {
      if (!Number.isInteger(provinceId) || Number(provinceId) <= 0) {
        setError("لطفاً استان را انتخاب کنید.");
        return;
      }

      if (!Number.isInteger(form.cityId) || form.cityId <= 0) {
        setError("لطفاً شهر را انتخاب کنید.");
        return;
      }

      if (!deliveryForm.deliverToName.trim()) {
        setError("نام تحویل‌گیرنده را وارد کنید.");
        return;
      }

      if (!deliveryForm.deliverToMobileNumber.trim()) {
        setError("شماره موبایل تحویل‌گیرنده را وارد کنید.");
        return;
      }

      if (!deliveryForm.Adrs.trim()) {
        setError("آدرس را وارد کنید.");
        return;
      }

      if (!deliveryForm.PostalCode?.trim()) {
        setError("کد پستی را وارد کنید.");
        return;
      }
    }

    try {
      setSubmitting(true);
      await updateMyProfile({
        ...profileForm,
        fullName: profileForm.fullName.trim(),
      });
      const storageKey = "checkout:idempotency-key";

      let idempotencyKey = sessionStorage.getItem(storageKey);

      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();

        sessionStorage.setItem(storageKey, idempotencyKey);
      }
      const order = await createOrder(
        {
          branchId: selectedBranchId,
          paymentMethodId: selectedPaymentMethodId,
          deliveryAddress:
            orderAddressId !== null
              ? {
                  addressId: orderAddressId,
                }
              : {
                  cityId: deliveryForm.cityId,
                  deliverToName: deliveryForm.deliverToName.trim(),
                  deliverToMobileNumber: deliveryForm.deliverToMobileNumber.trim(),
                  deliverToPhoneNumber:
                    deliveryForm.deliverToPhoneNumber?.trim() || undefined,
                  Adrs: deliveryForm.Adrs.trim(),
                  PostalCode: deliveryForm.PostalCode?.trim() || undefined,
                  RowDesc: deliveryForm.RowDesc?.trim() || undefined,
                },
        },
        idempotencyKey,
      );

      /*
       * بسته به response واقعی submitOrder ممکن است
       * شناسه سفارش در order.data.id یا order.data.orderId باشد.
       *
       * این قسمت را مطابق response واقعی API تنظیم کن.
       */

      const orderId = order.orderHId;

      sessionStorage.removeItem("checkout:idempotency-key");
      if (orderId) {
        navigate(`/orders/${orderId}`);
        return;
      }

      // اگر هنوز صفحه order detail نداریم
      navigate("/orders");
    } catch (err) {
      console.error("Checkout error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("ثبت سفارش انجام نشد. لطفاً دوباره تلاش کنید.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>در حال دریافت سبد خرید...</span>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />

            <h2 className="text-xl font-semibold">سبد خرید شما خالی است</h2>

            <p className="text-sm text-muted-foreground">
              برای ادامه خرید ابتدا محصولی به سبد خرید اضافه کنید.
            </p>

            <Button onClick={() => navigate("/products")}>
              مشاهده محصولات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowRight className="h-5 w-5" />
        </Button>

        <div>
          <span className="text-xs font-bold text-primary">
            مرحله نهایی خرید
          </span>
          <h1 className="text-2xl font-extrabold">تکمیل سفارش</h1>

          <p className="text-sm text-muted-foreground">
            آدرس تحویل و اطلاعات سفارش را بررسی کنید.
          </p>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات حساب کاربری</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileLoading ? (
                <p className="text-sm text-muted-foreground">در حال دریافت اطلاعات حساب...</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    برای ثبت سفارش، نام و اطلاعات تماس خود را تکمیل یا اصلاح کنید.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="profileFullName">نام و نام خانوادگی</Label>
                      <Input id="profileFullName" value={profileForm.fullName}
                        onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
                        placeholder="نام و نام خانوادگی" />
                    </div>
                    <div className="space-y-2">
                      <Label>شماره موبایل تأییدشده</Label>
                      <Input value={profile?.mobile ?? ""} readOnly dir="ltr" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profilePhone">تلفن ثابت (اختیاری)</Label>
                      <Input id="profilePhone" value={profileForm.phoneNumber}
                        onChange={(event) => setProfileForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                        dir="ltr" placeholder="021..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profileEmail">ایمیل (اختیاری)</Label>
                      <Input id="profileEmail" type="email" value={profileForm.email}
                        onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                        dir="ltr" placeholder="name@example.com" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="profileNationalCode">کد ملی (اختیاری)</Label>
                      <Input id="profileNationalCode" value={profileForm.nationalCode}
                        onChange={(event) => setProfileForm((current) => ({ ...current, nationalCode: event.target.value }))}
                        dir="ltr" maxLength={10} />
                    </div>
                  </div>
                  {(!profileForm.fullName.trim() || !profile?.mobile) && (
                    <p className="text-xs text-amber-700">تکمیل نام و نام خانوادگی برای ثبت سفارش الزامی است.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>چه کسی سفارش را تحویل می‌گیرد؟</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => handleReceiverTypeChange("self")}
                className={`rounded-xl border p-4 text-right transition ${receiverType === "self" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <span className="block font-semibold">خودم تحویل می‌گیرم</span>
                <span className="mt-1 block text-xs text-muted-foreground">اطلاعات حساب و آدرس‌های خودم</span>
              </button>
              <button type="button" onClick={() => handleReceiverTypeChange("other")}
                className={`rounded-xl border p-4 text-right transition ${receiverType === "other" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <span className="block font-semibold">شخص دیگری تحویل می‌گیرد</span>
                <span className="mt-1 block text-xs text-muted-foreground">ثبت نام، موبایل و آدرس گیرنده جدید</span>
              </button>
            </CardContent>
          </Card>

          {/* Address selector */}
          {receiverType === "self" && (
            <AddressSelector
              selectedAddressId={selectedAddressId}
              addresses={selectableAddresses}
              isLoading={addressesLoading}
              onSelect={handleSelectAddress}
              onNewAddress={handleNewAddress}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                انتخاب شعبه ارسال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedBranchId ? String(selectedBranchId) : ""}
                onValueChange={(value) => {
                  const id = Number(value);
                  setSelectedBranchIdState(id);
                  setSelectedBranchId(id);
                }}
                disabled={branchesQuery.isLoading || !branchesQuery.data?.data.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder={branchesQuery.isLoading ? "در حال دریافت شعب..." : "شعبه را انتخاب کنید"} />
                </SelectTrigger>
                <SelectContent>
                  {branchesQuery.data?.data.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}{branch.isDefault ? " (پیشنهادی)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {branchesQuery.data?.data.length === 0 && (
                <p className="mt-2 text-sm text-destructive">برای شهر انتخاب‌شده شعبه فروشگاهی فعالی تعریف نشده است.</p>
              )}
            </CardContent>
          </Card>

          {/* New address form */}
          {selectedAddressId === null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {receiverType === "self" ? "آدرس تحویل خودم" : "آدرس گیرنده جدید"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Selected address status */}
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  <p className="font-medium">{receiverType === "self" ? "آدرس جدید برای خودم" : "ثبت آدرس برای گیرنده دیگر"}</p>

                  <p className="mt-1 text-muted-foreground">
                    اطلاعات زیر را کامل کنید.
                  </p>
                </div>

                {/* Recipient */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="deliverToName">نام تحویل‌گیرنده</Label>

                    <Input
                      id="deliverToName"
                      value={form.deliverToName}
                      onChange={(event) =>
                        handleChange("deliverToName", event.target.value)
                      }
                      placeholder="نام و نام خانوادگی"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile">شماره موبایل</Label>

                    <Input
                      id="mobile"
                      value={form.deliverToMobileNumber}
                      onChange={(event) =>
                        handleChange(
                          "deliverToMobileNumber",
                          event.target.value,
                        )
                      }
                      placeholder="0912..."
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    تلفن ثابت
                    <span className="mr-1 text-muted-foreground">
                      (اختیاری)
                    </span>
                  </Label>

                  <Input
                    id="phone"
                    value={form.deliverToPhoneNumber ?? ""}
                    onChange={(event) =>
                      handleChange("deliverToPhoneNumber", event.target.value)
                    }
                    placeholder="021..."
                    dir="ltr"
                  />
                </div>

                <LocationSelector
                  provinceId={provinceId}
                  cityId={form.cityId || null}
                  onProvinceChange={handleProvinceChange}
                  onCityChange={handleCityChange}
                />

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">آدرس</Label>

                  <Textarea
                    id="address"
                    value={form.Adrs}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleChange("Adrs", event.target.value)
                    }
                    placeholder="آدرس کامل..."
                    rows={4}
                  />
                </div>

                {/* Postal code */}
                <div className="space-y-2">
                  <Label htmlFor="postalCode">کد پستی</Label>

                  <Input
                    id="postalCode"
                    value={form.PostalCode ?? ""}
                    onChange={(event) =>
                      handleChange("PostalCode", event.target.value)
                    }
                    placeholder="۱۰ رقم"
                    maxLength={10}
                    dir="ltr"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    توضیحات
                    <span className="mr-1 text-muted-foreground">
                      (اختیاری)
                    </span>
                  </Label>

                  <Textarea
                    id="description"
                    value={form.RowDesc ?? ""}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleChange("RowDesc", event.target.value)
                    }
                    placeholder="مثلاً زنگ واحد ۲..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected address preview */}
          {selectedAddress && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  آدرس انتخاب‌شده
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">
                      {selectedAddress.recipient.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {selectedAddress.recipient.mobile}
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div className="text-sm">
                      <p>
                        {selectedAddress.province?.name}
                        {"، "}
                        {selectedAddress.county?.name}
                        {"، "}
                        {selectedAddress.city?.name}
                      </p>

                      <p className="mt-1 text-muted-foreground">
                        {selectedAddress.address}
                      </p>
                    </div>
                  </div>

                  {selectedAddress.postalCode && (
                    <p className="text-sm text-muted-foreground">
                      کد پستی: {selectedAddress.postalCode}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleEditSelectedAddress}>
                      ویرایش این آدرس
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleNewAddress}>
                      ثبت آدرس دیگر
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment method */}
          <Card>
            <CardHeader>
              <CardTitle>روش پرداخت</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethodsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال دریافت روش‌های پرداخت...
                </div>
              ) : paymentMethods.length === 0 ? (
                <p className="text-sm text-destructive">
                  در حال حاضر روش پرداخت فعالی برای فروشگاه تعریف نشده است.
                </p>
              ) : (
                paymentMethods.map((method) => (
                  <label
                    key={method.rowId}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${selectedPaymentMethodId === method.rowId ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="mt-1"
                      value={method.rowId}
                      checked={selectedPaymentMethodId === method.rowId}
                      onChange={() => setSelectedPaymentMethodId(method.rowId)}
                      disabled={submitting}
                    />
                    <span className="min-w-0">
                      <span className="block font-medium">{method.name}</span>
                      {method.description && (
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {method.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                محصولات سفارش
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {cart.items.map((item: CartItem) => (
                <div
                  key={item.goodId}
                  className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                >
                  {/* Image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.rowName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 font-medium">{item.rowName}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      تعداد: {item.quantity}
                    </p>

                    <p className="mt-1 text-sm">
                      قیمت واحد: {item.unitPrice.toLocaleString("fa-IR")} تومان
                    </p>
                  </div>

                  {/* Total */}
                  <div className="shrink-0 text-left">
                    <p className="font-semibold">
                      {item.totalPrice.toLocaleString("fa-IR")}
                    </p>

                    <p className="text-xs text-muted-foreground">تومان</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="border border-emerald-950/5 lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>خلاصه سفارش</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">تعداد کالا</span>

                <span>{cart.totalQuantity.toLocaleString("fa-IR")}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">تعداد اقلام</span>

                <span>{cart.itemsCount.toLocaleString("fa-IR")}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">مبلغ قابل پرداخت</span>

                  <div className="text-left">
                    <span className="text-xl font-bold">
                      {cart.subtotal.toLocaleString("fa-IR")}
                    </span>

                    <span className="mr-1 text-sm">تومان</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={
                  submitting ||
                  paymentMethodsLoading ||
                  paymentMethods.length === 0 ||
                  selectedPaymentMethodId === null
                }
                onClick={handleSubmitOrder}
              >
                {submitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    در حال ثبت سفارش...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                    ثبت و ادامه پرداخت
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                با ثبت سفارش، اطلاعات سبد خرید و آدرس شما برای ثبت سفارش نهایی
                بررسی می‌شود.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
