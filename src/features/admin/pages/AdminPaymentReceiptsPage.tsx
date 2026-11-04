import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Receipt,
  CheckCircle2,
  XCircle,
  CreditCard,
  UserRound,
  CalendarDays,
  Clock3,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import {
  approvePaymentReceipt,
  getPendingPaymentReceipts,
  rejectPaymentReceipt,
  type AdminPaymentReceipt,
} from "@/features/admin/services/admin-payment-receipts.api";

const money = new Intl.NumberFormat("fa-IR");

function formatMoney(value: number | null) {
  if (value == null) return "—";
  return money.format(value);
}

function formatDepositDate(receipt: AdminPaymentReceipt) {
  const { year, month, day } = receipt.depositDate;

  if (!year || !month || !day) return "ثبت نشده";

  return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
}

function formatDepositTime(receipt: AdminPaymentReceipt) {
  const { hour, minute } = receipt.depositTime;

  if (!hour || !minute) return "ثبت نشده";

  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function ReceiptSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function AdminPaymentReceiptsPage() {
  const [receipts, setReceipts] = useState<AdminPaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadReceipts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPendingPaymentReceipts();
      setReceipts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "دریافت رسیدهای پرداخت ناموفق بود.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReceipts();
  }, [loadReceipts]);

  async function handleApprove(receipt: AdminPaymentReceipt) {
    const confirmed = window.confirm(
      `آیا از تأیید پرداخت سفارش ${receipt.docNo} مطمئن هستید؟`,
    );

    if (!confirmed) return;

    setBusyAction(`approve-${receipt.id}`);
    setError(null);
    setNotice(null);

    try {
      await approvePaymentReceipt(receipt.id);
      setNotice(`پرداخت سفارش ${receipt.docNo} با موفقیت تأیید شد.`);
      await loadReceipts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "تأیید پرداخت ناموفق بود.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleReject(receipt: AdminPaymentReceipt) {
    const confirmed = window.confirm(
      `آیا از رد رسید پرداخت سفارش ${receipt.docNo} مطمئن هستید؟`,
    );

    if (!confirmed) return;

    setBusyAction(`reject-${receipt.id}`);
    setError(null);
    setNotice(null);

    try {
      await rejectPaymentReceipt(receipt.id);
      setNotice(`رسید پرداخت سفارش ${receipt.docNo} رد شد.`);
      await loadReceipts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "رد رسید پرداخت ناموفق بود.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section dir="rtl" className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800">
            <Receipt className="size-5" />
            <span className="text-sm font-semibold">مدیریت پرداخت‌ها</span>
          </div>

          <h1 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            رسیدهای کارت‌به‌کارت
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            رسیدهای ثبت‌شده توسط مشتریان را بررسی و تأیید یا رد کنید.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadReceipts()}
          disabled={loading || busyAction !== null}
        >
          <RefreshCw
            className={`ml-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          بروزرسانی
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <AlertTriangle className="size-5 shrink-0" />
        <p className="text-sm leading-6">
          اطلاعات رسید به‌تنهایی اثبات‌کننده واریز نیست. پیش از تأیید، مبلغ،
          شماره پیگیری و گردش حساب بانکی را بررسی کنید.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {notice && (
        <Alert
          className="border-emerald-200 bg-emerald-50 text-emerald-900"
          role="status"
        >
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3">
        <span className="text-sm text-muted-foreground">
          رسیدهای در انتظار بررسی
        </span>
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          {money.format(receipts.length)} رسید
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <ReceiptSkeleton key={index} />
          ))}
        </div>
      ) : receipts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center px-4 py-16 text-center">
            <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-emerald-700">
              <CheckCircle2 className="size-9" />
            </div>
            <h2 className="font-bold">رسید در انتظاری وجود ندارد</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              در حال حاضر تمام رسیدهای ثبت‌شده بررسی شده‌اند.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {receipts.map((receipt) => {
            const amountMatches =
              receipt.payableAmount != null &&
              receipt.depositAmount != null &&
              receipt.payableAmount === receipt.depositAmount;

            const isBusy = busyAction !== null;

            return (
              <Card key={receipt.id} className="overflow-hidden">
                <CardHeader className="gap-3 border-b bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                      سفارش شماره {receipt.docNo}
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        در انتظار بررسی
                      </Badge>
                    </CardTitle>

                    {receipt.orderDate && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        تاریخ سفارش: {receipt.orderDate}
                      </p>
                    )}
                  </div>

                  <div className="text-right sm:text-left">
                    <p className="text-xs text-muted-foreground">
                      مبلغ قابل پرداخت
                    </p>
                    <p className="mt-1 text-lg font-extrabold tabular-nums">
                      {formatMoney(receipt.payableAmount)}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 p-4 sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <UserRound className="size-4" />
                        مشتری
                      </div>
                      <p className="font-semibold">
                        {receipt.customer?.name || "نامشخص"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {receipt.customer?.mobile || "شماره همراه ثبت نشده"}
                      </p>
                    </div>

                    <div className="rounded-xl border p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <CreditCard className="size-4" />
                        حساب مقصد
                      </div>
                      <p className="font-semibold">
                        {receipt.bankAccount?.bankName || "نامشخص"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        کارت: {receipt.bankAccount?.cardNumber || "—"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        صاحب حساب: {receipt.bankAccount?.ownerName || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="size-4" />
                        زمان واریز
                      </div>
                      <p className="font-semibold tabular-nums">
                        {formatDepositDate(receipt)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                        ساعت {formatDepositTime(receipt)}
                      </p>
                    </div>

                    <div className="rounded-xl border p-3">
                      <p className="mb-2 text-xs text-muted-foreground">
                        مبلغ واریزی
                      </p>
                      <p className="text-lg font-bold tabular-nums">
                        {formatMoney(receipt.depositAmount)}
                      </p>
                      {!amountMatches && (
                        <p className="mt-2 text-xs font-medium text-rose-600">
                          مبلغ واریزی با مبلغ سفارش مطابقت ندارد.
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border p-3">
                      <p className="mb-2 text-xs text-muted-foreground">
                        شماره پیگیری
                      </p>
                      <p className="break-all font-bold tabular-nums">
                        {receipt.trackingNumber || "ثبت نشده"}
                      </p>
                    </div>

                    <div className="rounded-xl border p-3">
                      <p className="mb-2 text-xs text-muted-foreground">
                        چهار رقم آخر کارت مبدأ
                      </p>
                      <p className="font-bold tracking-widest tabular-nums">
                        {receipt.lastFourDigits
                          ? `**** ${receipt.lastFourDigits}`
                          : "ثبت نشده"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                      disabled={isBusy}
                      onClick={() => void handleReject(receipt)}
                    >
                      <XCircle className="ml-2 size-4" />
                      {busyAction === `reject-${receipt.id}`
                        ? "در حال رد..."
                        : "رد رسید"}
                    </Button>

                    <Button
                      type="button"
                      className="bg-emerald-700 hover:bg-emerald-800"
                      disabled={isBusy || !amountMatches}
                      onClick={() => void handleApprove(receipt)}
                    >
                      <CheckCircle2 className="ml-2 size-4" />
                      {busyAction === `approve-${receipt.id}`
                        ? "در حال تأیید..."
                        : "تأیید پرداخت"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
