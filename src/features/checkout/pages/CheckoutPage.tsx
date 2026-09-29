import { useEffect } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatter";
import { useCartStore } from "@/stores/cart.store";
import { useState } from "react";
import axios from "axios";
import { createOrder, type OrderDeliveryAddress } from "@/services/orders.api";

import { useOrderStore } from "@/stores/order.store";

export function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const error = useCartStore((state) => state.error);
  const [form, setForm] = useState<OrderDeliveryAddress>({
    provinceId: 0,
    deliverToName: "",
    deliverToMobileNumber: "",
    deliverToPhoneNumber: "",
    City: "",
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

    if (!form.provinceId) {
      return;
    }

    if (!form.deliverToName.trim()) {
      return;
    }

    if (!form.deliverToMobileNumber.trim()) {
      return;
    }

    if (!form.City.trim()) {
      return;
    }

    if (!form.Adrs.trim()) {
      return;
    }

    try {
      const order = await submitOrder({
        deliveryAddress: {
          provinceId: form.provinceId,
          deliverToName: form.deliverToName.trim(),
          deliverToMobileNumber: form.deliverToMobileNumber.trim(),
          deliverToPhoneNumber: form.deliverToPhoneNumber?.trim() || undefined,
          City: form.City.trim(),
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
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        console.error(error.response.data.message);
      }
    }
  }

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
                    value={form.provinceId}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        provinceId: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value={0}>انتخاب استان</option>

                    {/* فعلاً موقت */}
                    {/* بعداً از API استان‌ها پر می‌شود */}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">شهر</label>

                  <input
                    value={form.City}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        City: event.target.value,
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="شهر"
                    required
                  />
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

            <Button className="w-full" size="lg" disabled>
              ثبت سفارش
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              مرحله ثبت سفارش در حال تکمیل است.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
