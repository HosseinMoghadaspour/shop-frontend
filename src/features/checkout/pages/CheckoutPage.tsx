import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatter";
import { useCartStore } from "@/stores/cart.store";
import { type OrderDeliveryAddress } from "@/services/orders.api";
import { useOrderStore } from "@/stores/order.store";
import {
  getCitiesByProvince,
  getProvinces,
  type City,
  type Province,
} from "@/services/locations.api";

export function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const error = useCartStore((state) => state.error);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);

  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [locationError, setLocationError] = useState<string | null>(null);
  const [provinceId, setProvinceId] = useState(0);
  const [form, setForm] = useState<OrderDeliveryAddress>({
    cityId: 0,
    deliverToName: "",
    deliverToMobileNumber: "",
    deliverToPhoneNumber: "",
    Adrs: "",
    PostalCode: "",
    RowDesc: "",
  });
  const submitOrder = useOrderStore((state) => state.submitOrder);
  const isSubmitting = useOrderStore((state) => state.isSubmitting);
  const orderError = useOrderStore((state) => state.error);
  const resetCart = useCartStore((state) => state.reset);
  async function handleSubmitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!provinceId) {
      return;
    }

    if (!form.cityId) {
      return;
    }

    if (!form.deliverToName.trim()) {
      return;
    }

    if (!form.deliverToMobileNumber.trim()) {
      return;
    }

    if (!form.Adrs.trim()) {
      return;
    }

    try {
      const order = await submitOrder({
        deliveryAddress: {
          cityId: form.cityId,
          deliverToName: form.deliverToName.trim(),
          deliverToMobileNumber: form.deliverToMobileNumber.trim(),
          deliverToPhoneNumber: form.deliverToPhoneNumber?.trim() || undefined,
          Adrs: form.Adrs.trim(),
          PostalCode: form.PostalCode?.trim() || undefined,
          RowDesc: form.RowDesc?.trim() || undefined,
        },
      });
      resetCart();
      navigate(
        `/checkout/success?orderId=${order.orderHId}&docNo=${order.docNo}`,
        {
          replace: true,
        },
      );
    } catch {}
  }

  useEffect(() => {
    async function loadProvinces() {
      setIsLoadingProvinces(true);
      setLocationError(null);

      try {
        const result = await getProvinces();

        setProvinces(result);
      } catch {
        setLocationError("دریافت لیست استان‌ها با خطا مواجه شد.");
      } finally {
        setIsLoadingProvinces(false);
      }
    }

    void loadProvinces();
  }, []);

  useEffect(() => {
    if (!provinceId) {
      setCities([]);
      return;
    }

    async function loadCities() {
      setIsLoadingCities(true);
      setLocationError(null);

      try {
        const result = await getCitiesByProvince(provinceId);
        setCities(result);
      } catch {
        setCities([]);
        setLocationError("دریافت لیست شهرها با خطا مواجه شد.");
      } finally {
        setIsLoadingCities(false);
      }
    }

    void loadCities();
  }, [provinceId]);

  useEffect(() => {
    if (!cart) {
      void fetchCart();
    }
  }, [cart, fetchCart]);

  if (isLoading && !cart) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />

          <span>در حال دریافت اطلاعات سفارش...</span>
        </div>
      </section>
    );
  }

  if (error && !cart) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <AlertCircle className="mb-4 h-10 w-10 text-destructive" />

            <h1 className="text-lg font-semibold">
              دریافت اطلاعات سفارش با خطا مواجه شد
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">{error}</p>

            <Button className="mt-5" onClick={() => void fetchCart()}>
              تلاش مجدد
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <Card className="w-full">
          <CardContent className="py-10 text-center">
            <h1 className="text-xl font-bold">سبد خرید شما خالی است</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              برای ثبت سفارش ابتدا محصولی به سبد خرید اضافه کنید.
            </p>

            <Button className="mt-5" onClick={() => navigate("/products")}>
              مشاهده محصولات
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به سبد خرید
        </Link>

        <h1 className="mt-4 text-2xl font-bold">تکمیل سفارش</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>محصولات سفارش</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="divide-y">
              {cart.items.map((item) => (
                <div
                  key={item.goodId}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{item.rowName}</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      تعداد: {item.quantity.toLocaleString("fa-IR")}
                    </p>
                  </div>

                  <div className="shrink-0 text-left">
                    <p className="font-medium">
                      {formatPrice(item.totalPrice)}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatPrice(item.unitPrice)} ×{" "}
                      {item.quantity.toLocaleString("fa-IR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>اطلاعات تحویل</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    نام تحویل گیرنده
                  </label>

                  <input
                    value={form.deliverToName}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        deliverToName: event.target.value,
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="نام و نام خانوادگی"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">شماره موبایل</label>

                  <input
                    value={form.deliverToMobileNumber}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        deliverToMobileNumber: event.target.value,
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0912..."
                    dir="ltr"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">استان</label>

                  <select
                    value={provinceId}
                    onChange={(event) => {
                      const selectedProvinceId = Number(event.target.value);

                      setProvinceId(selectedProvinceId);

                      setForm((prev) => ({
                        ...prev,
                        cityId: 0,
                      }));

                      setCities([]);
                    }}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    required
                    disabled={isLoadingProvinces}
                  >
                    <option value={0}>
                      {isLoadingProvinces
                        ? "در حال دریافت استان‌ها..."
                        : "انتخاب استان"}
                    </option>

                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">شهر</label>

                  <select
                    value={form.cityId}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        cityId: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    required
                    disabled={!provinceId || isLoadingCities}
                  >
                    <option value="">
                      {!provinceId
                        ? "ابتدا استان را انتخاب کنید"
                        : isLoadingCities
                          ? "در حال دریافت شهرها..."
                          : "انتخاب شهر"}
                    </option>

                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">آدرس کامل</label>

                  <textarea
                    value={form.Adrs}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        Adrs: event.target.value,
                      }))
                    }
                    className="min-h-28 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="آدرس کامل محل تحویل"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">کد پستی</label>

                  <input
                    value={form.PostalCode}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        PostalCode: event.target.value,
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="کد پستی"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">تلفن ثابت</label>

                  <input
                    value={form.deliverToPhoneNumber}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        deliverToPhoneNumber: event.target.value,
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="تلفن ثابت"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">توضیحات</label>

                  <textarea
                    value={form.RowDesc}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        RowDesc: event.target.value,
                      }))
                    }
                    className="min-h-20 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="توضیحات سفارش، در صورت نیاز"
                  />
                </div>
              </div>
              {locationError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {locationError}
                </div>
              )}

              {orderError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {orderError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "در حال ثبت سفارش..." : "ثبت سفارش"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>خلاصه سفارش</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">تعداد کالا</span>

              <span>{cart.totalQuantity.toLocaleString("fa-IR")}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">مبلغ کالاها</span>

              <span>{formatPrice(cart.subtotal)}</span>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">مبلغ نهایی</span>

                <span className="text-xl font-bold">
                  {formatPrice(cart.subtotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
