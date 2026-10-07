import { useMemo, useState } from "react";
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

import AddressSelector from "../components/AddressSelector";
import { useAddresses } from "@/features/addresses/hooks/useAddresses";
import LocationSelector from "../components/LocationSelector";
import { useCart } from "@/features/cart/hooks/useCart";
import { createOrder } from "@/services/orders.api";
import type { OrderDeliveryAddress } from "@/services/orders.api";

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

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [provinceId, setProvinceId] = useState<number | null>(null);

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

  const selectedAddress = useMemo(() => {
    if (!selectedAddressId || !addresses) {
      return null;
    }

    return (
      addresses.find((address) => address.id === selectedAddressId) ?? null
    );
  }, [addresses, selectedAddressId]);

  const handleSelectAddress = (
    address: NonNullable<typeof addresses>[number],
  ) => {
    setSelectedAddressId(address.id);
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
    setSelectedAddressId(null);
    setProvinceId(null);
    setError(null);

    setForm({
      cityId: 0,
      deliverToName: "",
      deliverToMobileNumber: "",
      deliverToPhoneNumber: "",
      Adrs: "",
      PostalCode: "",
      RowDesc: "",
    });
  };

  const handleChange = (
    field: keyof OrderDeliveryAddress,
    value: string | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (selectedAddressId !== null) {
      setSelectedAddressId(null);
      setProvinceId(null);
    }
  };

  const handleProvinceChange = (value: number | null) => {
    setProvinceId(value);

    setForm((prev) => ({
      ...prev,
      cityId: 0,
    }));
  };

  const handleCityChange = (value: number | null) => {
    setForm((prev) => ({
      ...prev,
      cityId: value ?? 0,
    }));
  };

  const handleSubmitOrder = async () => {
    setError(null);

    if (cartLoading) {
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      setError("سبد خرید شما خالی است.");
      return;
    }

    if (selectedAddressId === null) {
      if (!Number.isInteger(provinceId) || Number(provinceId) <= 0) {
        setError("لطفاً استان را انتخاب کنید.");
        return;
      }

      if (!Number.isInteger(form.cityId) || form.cityId <= 0) {
        setError("لطفاً شهر را انتخاب کنید.");
        return;
      }

      if (!form.deliverToName.trim()) {
        setError("نام تحویل‌گیرنده را وارد کنید.");
        return;
      }

      if (!form.deliverToMobileNumber.trim()) {
        setError("شماره موبایل تحویل‌گیرنده را وارد کنید.");
        return;
      }

      if (!form.Adrs.trim()) {
        setError("آدرس را وارد کنید.");
        return;
      }

      if (!form.PostalCode?.trim()) {
        setError("کد پستی را وارد کنید.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const order = await createOrder({
        deliveryAddress:
          selectedAddressId !== null
            ? {
                addressId: selectedAddressId,
              }
            : {
                cityId: form.cityId,
                deliverToName: form.deliverToName.trim(),
                deliverToMobileNumber: form.deliverToMobileNumber.trim(),
                deliverToPhoneNumber:
                  form.deliverToPhoneNumber?.trim() || undefined,
                Adrs: form.Adrs.trim(),
                PostalCode: form.PostalCode?.trim() || undefined,
                RowDesc: form.RowDesc?.trim() || undefined,
              },
      });

      /*
       * بسته به response واقعی submitOrder ممکن است
       * شناسه سفارش در order.data.id یا order.data.orderId باشد.
       *
       * این قسمت را مطابق response واقعی API تنظیم کن.
       */

      const orderId = order.orderHId;

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
      <div className="container mx-auto px-4 py-10">
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
    <div className="container mx-auto px-4 py-6" dir="rtl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowRight className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold">تکمیل سفارش</h1>

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
          {/* Address selector */}
          <AddressSelector
            selectedAddressId={selectedAddressId}
            addresses={addresses}
            isLoading={addressesLoading}
            onSelect={handleSelectAddress}
            onNewAddress={handleNewAddress}
          />

          {/* New address form */}
          {selectedAddressId === null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  آدرس جدید
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Selected address status */}
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  <p className="font-medium">آدرس جدید برای این سفارش</p>

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

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewAddress}
                  >
                    استفاده از آدرس جدید
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
          <Card className="sticky top-6">
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
                disabled={submitting}
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
