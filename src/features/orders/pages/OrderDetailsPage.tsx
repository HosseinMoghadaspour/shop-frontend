import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getOrderById,
  type OrderDetail,
  type OrderHeader,
} from "@/services/orders.api";

function formatPrice(value: number | null) {
  if (value == null) return "۰";

  return new Intl.NumberFormat("fa-IR").format(value);
}

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<OrderHeader | null>(null);

  const [items, setItems] = useState<OrderDetail[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("شناسه سفارش نامعتبر است.");
      setIsLoading(false);
      return;
    }

    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      setError("شناسه سفارش نامعتبر است.");
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function loadOrder() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getOrderById(orderId);

        if (!mounted) return;

        if (!result.orderH) {
          setError("سفارش مورد نظر پیدا نشد.");
          return;
        }

        setOrder(result.orderH);
        setItems(result.orderD);
      } catch (error) {
        if (!mounted) return;

        const message =
          error instanceof Error
            ? error.message
            : "دریافت سفارش با خطا مواجه شد.";

        setError(message);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          در حال دریافت اطلاعات سفارش...
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-red-600">{error || "سفارش پیدا نشد."}</p>

          <Link to="/orders" className="rounded-lg border px-4 py-2 text-sm">
            بازگشت به سفارش‌ها
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-950/5 bg-white p-5 sm:p-6">
        <div>
          <p className="text-sm text-muted-foreground">سفارش شماره</p>

          <h1 className="text-2xl font-bold">
            {order.DocNo.toLocaleString("fa-IR")}
          </h1>
        </div>

        <Link
          to="/orders"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          سفارش‌های من
        </Link>
      </div>

      <div className="mb-6 grid gap-4 rounded-2xl border border-emerald-950/5 bg-white p-5 sm:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">تاریخ سفارش</p>

          <p className="mt-1 font-medium">{order.FDate}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">مبلغ کل</p>

          <p className="mt-1 font-medium">
            {formatPrice(order.TotalPrice)} تومان
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">مبلغ قابل پرداخت</p>

          <p className="mt-1 font-bold">
            {formatPrice(order.PayablePrice)} تومان
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-emerald-950/5 bg-white">
        <div className="border-b bg-muted/40 p-5">
          <h2 className="font-bold">اقلام سفارش</h2>
        </div>

        <div className="divide-y">
          {items.map((item) => (
            <div
              key={`${item.OrderH_ID}-${item.Good_ID}`}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {item.Good?.RowName || `کالای ${item.Good_ID}`}
                </p>

                {item.Good?.RowCode && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    کد کالا: {item.Good.RowCode}
                  </p>
                )}
              </div>

              <div className="text-sm">
                <p>تعداد: {item.OutputValue.toLocaleString("fa-IR")}</p>

                <p className="text-muted-foreground">
                  قیمت واحد: {formatPrice(item.UnitPrice)} تومان
                </p>
              </div>

              <div className="font-bold">
                {formatPrice(item.TotalPrice)} تومان
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-emerald-950/5 bg-white p-5">
        <h2 className="mb-4 font-bold">خلاصه مالی</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>مبلغ کل</span>
            <span>{formatPrice(order.TotalPrice)} تومان</span>
          </div>

          <div className="flex justify-between">
            <span>
              تخفیف
              {order.DiscountPercent != null &&
                ` (${formatPrice(order.DiscountPercent)}٪)`}
            </span>

            <span>{formatPrice(order.DiscountPrice)} تومان</span>
          </div>

          <div className="flex justify-between">
            <span>
              مالیات
              {order.TaxPercent != null &&
                ` (${formatPrice(order.TaxPercent)}٪)`}
            </span>

            <span>{formatPrice(order.TaxPrice)} تومان</span>
          </div>

          <div className="flex justify-between border-t pt-3 text-base font-bold">
            <span>مبلغ قابل پرداخت</span>

            <span>{formatPrice(order.PayablePrice)} تومان</span>
          </div>
        </div>
      </section>
    </main>
  );
}
