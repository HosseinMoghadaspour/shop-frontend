import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getOrderById,
  type OrderDetail,
  type OrderHeader,
} from "@/services/orders.api";
import {
  getPublicBankAccounts,
  startOrderPayment,
  type PublicBankAccount,
  type StartPaymentResponse,
} from "@/services/payment.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

  const [paymentInfo, setPaymentInfo] = useState<StartPaymentResponse | null>(
    null,
  );

  const [bankAccounts, setBankAccounts] = useState<PublicBankAccount[]>([]);

  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  async function loadPaymentInfo(orderId: number) {
    try {
      setIsPaymentLoading(true);
      const payment = await startOrderPayment(orderId);
      setPaymentInfo(payment);

      if (payment.paymentMethodType === "CARD_TO_CARD") {
        const account = await getPublicBankAccounts();
        setBankAccounts(account);
      }
    } catch (error) {
      console.error("خطا در دریافت اطلاعات پرداخت : ", error);
    } finally {
      setIsPaymentLoading(false);
    }
  }

  async function copyPaymentValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("کپی شد!");
    } catch (error) {
      console.error("کپی اطلاعات با خطا مواجه شد:", error);
      toast.error("کپی اطلاعات با خطا مواجه شد");
    }
  }

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
        await loadPaymentInfo(orderId);
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کالا</TableHead>
              <TableHead>تعداد</TableHead>
              <TableHead>قیمت واحد</TableHead>
              <TableHead className="text-end">مبلغ کل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={`${item.OrderH_ID}-${item.Good_ID}`}>
                <TableCell>
                  <div className="font-medium">
                    {item.Good?.RowName || `کالای ${item.Good_ID}`}
                  </div>
                  {item.Good?.RowCode && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      کد کالا: {item.Good.RowCode}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {item.OutputValue.toLocaleString("fa-IR")}
                </TableCell>
                <TableCell>{formatPrice(item.UnitPrice)} تومان</TableCell>
                <TableCell className="text-end font-bold">
                  {formatPrice(item.TotalPrice)} تومان
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

        {isPaymentLoading && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            در حال دریافت اطلاعات پرداخت...
          </div>
        )}
      </section>
      {paymentInfo && (
        <section className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                اطلاعات پرداخت
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                روش پرداخت: {paymentInfo.paymentMethodName}
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {paymentInfo.paymentStatusName}
            </span>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">مبلغ قابل پرداخت</p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {formatPrice(paymentInfo.payableAmount)} تومان
            </p>
          </div>

          {paymentInfo.paymentMethodType === "CARD_TO_CARD" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  واریز به یکی از حساب‌های زیر
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  پس از واریز وجه، اطلاعات رسید پرداخت را ثبت کنید.
                </p>
              </div>

              {bankAccounts.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  در حال حاضر حساب بانکی فعالی برای پرداخت معرفی نشده است. لطفاً
                  با پشتیبانی فروشگاه تماس بگیرید.
                </div>
              ) : (
                <div className="grid gap-3">
                  {bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-gray-900">
                          {account.bankName}
                        </h4>
                        <span className="text-xs text-gray-500">
                          به نام {account.accountOwnerName}
                        </span>
                      </div>

                      {account.cardNumber && (
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">شماره کارت</p>
                            <p
                              dir="ltr"
                              className="mt-1 text-base font-bold tracking-wider text-gray-900"
                            >
                              {account.cardNumber}
                            </p>
                          </div>

                          <Button
                            type="button"
                            onClick={() =>
                              copyPaymentValue(account.cardNumber!)
                            }
                            className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                          >
                            کپی شماره کارت
                          </Button>
                        </div>
                      )}

                      {account.accountNumber && (
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">شماره حساب</p>
                            <p
                              dir="ltr"
                              className="mt-1 font-medium text-gray-800"
                            >
                              {account.accountNumber}
                            </p>
                          </div>

                          <Button
                            type="button"
                            onClick={() =>
                              copyPaymentValue(account.accountNumber!)
                            }
                            className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                          >
                            کپی شماره حساب
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {paymentInfo.paymentMethodType === "PAY_IN_PLACE" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              پرداخت سفارش شما هنگام تحویل کالا انجام خواهد شد.
            </div>
          )}

          {paymentInfo.paymentMethodType === "GATEWAY" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              اتصال به درگاه بانکی در حال آماده‌سازی است. در حال حاضر امکان
              پرداخت آنلاین از این روش فراهم نشده است.
            </div>
          )}
        </section>
      )}
    </main>
  );
}
