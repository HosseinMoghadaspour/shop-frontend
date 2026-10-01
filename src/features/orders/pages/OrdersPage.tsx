import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getOrders,
  type OrderDetail,
  type OrderHeader,
} from "@/services/orders.api";

function formatPrice(value: number | null) {
  if (value == null) return ".";
  return new Intl.NumberFormat("fa-IR").format(value);
}

function getOrderItems(order: OrderHeader, details: OrderDetail[]) {
  return details.filter((item) => item.OrderH_ID === order.RowID);
}

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderHeader[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadOrders() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getOrders();

        if (!mounted) return;

        setOrders(result.orderH);
        setOrderDetails(result.orderD);
      } catch (error) {
        if (!mounted) return;
        const message =
          error instanceof Error ? error.message : "خطایی رخ داده است.";
        setError(message);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">سفارش‌های من</h1>

        <div className="rounded-xl border p-6 text-center">
          در حال دریافت سفارش‌ها...
        </div>
      </main>
    );
  }
  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">سفارش‌های من</h1>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error}
        </div>
      </main>
    );
  }
  if (orders.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">سفارش‌های من</h1>

        <div className="rounded-xl border p-8 text-center">
          <p className="mb-4 text-muted-foreground">
            هنوز سفارشی ثبت نکرده‌اید.
          </p>

          <Link
            to="/products"
            className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            مشاهده محصولات
          </Link>
        </div>
      </main>
    );
  }
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">سفارش‌های من</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const items = getOrderItems(order, orderDetails);

          return (
            <div
              key={order.RowID}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">شماره سفارش</p>

                  <p className="font-bold">
                    {order.DocNo.toLocaleString("fa-IR")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">تاریخ ثبت</p>
                  <p>{order.FDate}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    مبلغ قابل پرداخت
                  </p>

                  <p className="font-bold">
                    {formatPrice(order.PayablePrice)} تومان
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="mb-2 text-sm font-medium">اقلام سفارش</p>

                <div className="space-y-2">
                  {items.slice(0, 3).map((item) => (
                    <div
                      key={`${order.RowID}-${item.Good_ID}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {item.Good?.RowName || `کالای ${item.Good_ID}`}
                      </span>
                      <span className="text-muted-foreground">
                        × {item.OutputValue.toLocaleString("fa-IR")}
                      </span>
                    </div>
                  ))}

                  {items.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      و {items.length - 3} قلم دیگر...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to={`/orders/${order.RowID}`}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  مشاهده جزئیات
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
