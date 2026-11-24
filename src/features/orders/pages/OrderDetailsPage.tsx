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
  getOrderRequests,
  createOrderRequest,
  confirmOrderTotal,
  type OrderRequest,
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
  const [sendStatuses, setSendStatuses] = useState<Array<{ RowID: number; RowName: string | null }>>([]);
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestBusy, setRequestBusy] = useState(false);

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
        setSendStatuses(result.sendStatuses ?? []);
        const orderRequests = await getOrderRequests(orderId);
        if (mounted) setRequests(orderRequests);
        if (result.orderH.WorkflowStatusId === 3) {
          await loadPaymentInfo(orderId);
        }
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-950/5 bg-white p-5 sm:p-6">
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

      <div className="mb-6 grid gap-4 rounded-2xl border border-blue-950/5 bg-white p-5 sm:grid-cols-3">
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

      <section className="mb-6 rounded-2xl border border-blue-950/5 bg-white p-5">
        <div className="mb-5">
          <h2 className="font-bold">مسیر سفارش شما</h2>
          <p className="mt-1 text-sm text-muted-foreground">وضعیت آماده‌سازی و ارسال کالا را از این قسمت پیگیری کنید.</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-4">
          {sendStatuses.map((status, index) => {
            const currentId = order.SendStatusId ?? 1;
            const currentIndex = sendStatuses.findIndex((item) => item.RowID === currentId);
            const isCompleted = currentIndex >= 0 && index < currentIndex;
            const isCurrent = status.RowID === currentId;
            return (
              <li key={status.RowID} className="relative flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${isCompleted ? "border-blue-600 bg-blue-600 text-white" : isCurrent ? "border-blue-600 bg-blue-50 text-blue-700 ring-4 ring-blue-100" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
                  {isCompleted ? "✓" : index + 1}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${isCompleted || isCurrent ? "text-blue-800" : "text-muted-foreground"}`}>{status.RowName || "مرحله سفارش"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{isCompleted ? "تکمیل شده" : isCurrent ? "مرحله فعلی" : "در انتظار"}</p>
                </div>
              </li>
            );
          })}
        </ol>
        {sendStatuses.length === 0 && (
          <p className="text-sm text-muted-foreground">اطلاعات مراحل سفارش در دسترس نیست.</p>
        )}
      </section>

      <section className="mb-6 grid gap-3 rounded-2xl border border-blue-950/5 bg-white p-5 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">وضعیت ارسال</p>
          <p className="mt-2 inline-flex rounded-full bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-800">
            {order.DeliveryStatusName || "در حال بررسی"}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">وضعیت پرداخت</p>
          <p className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
            {order.PaymentStatusName || "در انتظار بررسی"}
          </p>
        </div>
      </section>

      {order.WorkflowStatusId === 1 && (
        <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-bold text-amber-900">در انتظار تعیین هزینه ارسال</h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">سفارش ثبت شده است. پس از بررسی مدیر و تعیین هزینه ارسال، مبلغ نهایی برای تأیید شما نمایش داده می‌شود.</p>
        </section>
      )}
      {order.WorkflowStatusId === 2 && (
        <section className="mb-6 space-y-4 rounded-2xl border border-blue-200 bg-white p-5">
          <div>
            <h2 className="font-bold">تأیید مبلغ نهایی سفارش</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">هزینه ارسال توسط فروشگاه مشخص شده است. لطفاً مبلغ نهایی را بررسی و تأیید کنید.</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-sm text-blue-800">هزینه ارسال</p>
            <p className="mt-1 text-lg font-bold text-blue-950">{formatPrice(order.ShippingQuote?.shippingCost ?? order.ShippingCost)} تومان</p>
            {order.ShippingQuote?.adminNote && <p className="mt-2 text-sm text-blue-900">{order.ShippingQuote.adminNote}</p>}
            {order.ShippingQuote?.expiresAt && <p className="mt-2 text-xs text-blue-800">مهلت تأیید: {new Date(order.ShippingQuote.expiresAt).toLocaleString("fa-IR")}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={async () => {
              try {
                await confirmOrderTotal(order.RowID, true);
                toast.success("مبلغ نهایی تأیید شد.");
                const refreshed = await getOrderById(order.RowID);
                if (refreshed.orderH) {
                  setOrder(refreshed.orderH);
                  await loadPaymentInfo(order.RowID);
                }
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "تأیید مبلغ ناموفق بود.");
              }
            }}>تأیید مبلغ و ادامه پرداخت</Button>
            <Button variant="outline" onClick={async () => {
              try {
                await confirmOrderTotal(order.RowID, false);
                setOrder((current) => current ? { ...current, WorkflowStatusId: 5 } : current);
                toast.success("مبلغ نهایی رد شد.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "ثبت پاسخ ناموفق بود.");
              }
            }}>رد مبلغ نهایی</Button>
          </div>
        </section>
      )}
      {order.WorkflowStatusId === 5 && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">مبلغ نهایی این سفارش توسط شما رد شده است. برای پیگیری با پشتیبانی تماس بگیرید.</section>
      )}
      {order.WorkflowStatusId === 4 && (
        <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800">پرداخت سفارش تأیید و سند انبار آن صادر شده است.</section>
      )}

      <section className="mb-6 rounded-2xl border border-blue-950/5 bg-white p-5">
        <div className="mb-4">
          <h2 className="font-bold">پشتیبانی و درخواست لغو</h2>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            درخواست شما برای بررسی به مدیریت ارسال می‌شود. ثبت درخواست به‌تنهایی سفارش را لغو نمی‌کند.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={requestBusy || requests.some((item) => item.requestType === 1 && (item.status === 1 || item.status === 2))}
            onClick={async () => {
              try {
                setRequestBusy(true);
                const created = await createOrderRequest(order.RowID, 1);
                setRequests((current) => [created, ...current]);
                toast.success("درخواست لغو برای بررسی ثبت شد.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "ثبت درخواست لغو ناموفق بود.");
              } finally {
                setRequestBusy(false);
              }
            }}
          >
            درخواست لغو سفارش
          </Button>
          <div className="flex min-w-0 flex-1 gap-2">
            <textarea
              value={requestMessage}
              onChange={(event) => setRequestMessage(event.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="شرح درخواست یا مشکل خود را بنویسید..."
              className="min-h-10 flex-1 resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              type="button"
              disabled={requestBusy || !requestMessage.trim()}
              onClick={async () => {
                try {
                  setRequestBusy(true);
                  const created = await createOrderRequest(order.RowID, 2, requestMessage.trim());
                  setRequests((current) => [created, ...current]);
                  setRequestMessage("");
                  toast.success("درخواست پشتیبانی ثبت شد.");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "ثبت درخواست پشتیبانی ناموفق بود.");
                } finally {
                  setRequestBusy(false);
                }
              }}
            >
              ارسال
            </Button>
          </div>
        </div>
        {requests.length > 0 && (
          <div className="mt-5 space-y-3 border-t pt-4">
            <h3 className="text-sm font-bold">پیگیری درخواست‌ها</h3>
            {requests.map((request) => (
              <div key={request.id} className="rounded-xl border bg-slate-50/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">
                    {request.requestType === 1 ? "درخواست لغو سفارش" : "درخواست پشتیبانی"}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    {request.status === 1 ? "ثبت‌شده" : request.status === 2 ? "در حال بررسی" : request.status === 3 ? "بسته‌شده" : "رد شده"}
                  </span>
                </div>
                {request.message && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{request.message}</p>}
                {request.adminResponse && (
                  <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <p className="text-xs font-bold text-blue-800">پاسخ پشتیبانی</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-blue-900">{request.adminResponse}</p>
                  </div>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {new Date(request.createdAt).toLocaleString("fa-IR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-blue-950/5 bg-white">
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

      <section className="mt-6 rounded-2xl border border-blue-950/5 bg-white p-5">
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

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
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
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
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
