import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ClipboardList, Search, RefreshCw, Eye, ChevronRight, PackageCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAdminOrderById,
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
  type AdminOrderDetail,
  type AdminOrdersResult,
} from "@/features/admin/services/admin-orders.api";

const numberFormat = new Intl.NumberFormat("fa-IR");
const money = (value: number | null) => value == null ? "—" : numberFormat.format(value);

const emptyResult: AdminOrdersResult = {
  items: [],
  statuses: { delivery: [], payment: [] },
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

export function AdminOrdersPage() {
  const [result, setResult] = useState(emptyResult);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deliveryDraft, setDeliveryDraft] = useState("");
  const [paymentDraft, setPaymentDraft] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrders({ page, limit: 20, search: search || undefined });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت سفارش‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function openDetails(order: AdminOrder) {
    setSelected(null);
    setDetailLoading(true);
    setError(null);
    try {
      const detail = await getAdminOrderById(order.id);
      setSelected(detail);
      setDeliveryDraft(detail.deliveryStatusId == null ? "" : String(detail.deliveryStatusId));
      setPaymentDraft(detail.paymentStatusId == null ? "" : String(detail.paymentStatusId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت جزئیات سفارش ناموفق بود.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveStatuses() {
    if (!selected) return;
    setBusy(selected.id);
    setError(null);
    setNotice(null);
    try {
      await updateAdminOrderStatus(selected.id, {
        ...(deliveryDraft ? { deliveryStatusId: Number(deliveryDraft) } : {}),
        ...(paymentDraft ? { paymentStatusId: Number(paymentDraft) } : {}),
      });
      setNotice(`وضعیت سفارش ${numberFormat.format(selected.docNo)} ذخیره شد.`);
      await openDetails(selected);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره وضعیت ناموفق بود.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section dir="rtl" className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800">
            <ClipboardList className="size-5" />
            <span className="text-sm font-semibold">فروش و پیگیری</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold">مدیریت سفارش‌ها</h1>
          <p className="mt-2 text-sm text-muted-foreground">بررسی سفارش‌ها و مدیریت وضعیت ارسال و پرداخت.</p>
        </div>
        <Button variant="outline" onClick={() => void loadOrders()} disabled={loading}>
          <RefreshCw className={`ml-2 size-4 ${loading ? "animate-spin" : ""}`} />
          بروزرسانی
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="جست‌وجو با شماره سفارش..." className="h-11 pr-9" />
            </div>
            <Button type="submit" className="h-11">جست‌وجو</Button>
            {search && <Button type="button" variant="outline" className="h-11" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}>پاک کردن</Button>}
          </form>
        </CardContent>
      </Card>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

      <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm">
        <span className="text-muted-foreground">تعداد کل سفارش‌ها</span>
        <strong>{numberFormat.format(result.pagination.total)}</strong>
      </div>

      {loading ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">در حال دریافت سفارش‌ها...</CardContent></Card>
      ) : result.items.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">سفارشی برای نمایش پیدا نشد.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {result.items.map((order: AdminOrder) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid flex-1 gap-3 sm:grid-cols-4">
                  <div><p className="text-xs text-muted-foreground">شماره سفارش</p><p className="mt-1 font-bold">#{numberFormat.format(order.docNo)}</p></div>
                  <div><p className="text-xs text-muted-foreground">تاریخ ثبت</p><p className="mt-1 font-medium">{order.date}</p></div>
                  <div><p className="text-xs text-muted-foreground">مشتری</p><p className="mt-1 font-medium">{order.customerMobile || (order.customerId ? `مشتری ${order.customerId}` : "نامشخص")}</p></div>
                  <div><p className="text-xs text-muted-foreground">مبلغ قابل پرداخت</p><p className="mt-1 font-extrabold">{money(order.payablePrice)} تومان</p></div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800">{order.deliveryStatusName}</span>
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">{order.paymentStatusName}</span>
                  <Button variant="outline" size="sm" onClick={() => void openDetails(order)}><Eye className="ml-2 size-4" /> جزئیات</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && result.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>قبلی</Button>
          <span className="text-sm text-muted-foreground">صفحه {numberFormat.format(page)} از {numberFormat.format(result.pagination.totalPages)}</span>
          <Button variant="outline" disabled={page >= result.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>بعدی</Button>
        </div>
      )}

      {(detailLoading || selected) && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="جزئیات سفارش">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            {detailLoading ? (
              <div className="py-12 text-center text-muted-foreground">در حال دریافت جزئیات سفارش...</div>
            ) : selected && (
              <>
                <div className="flex items-start justify-between gap-3 border-b pb-4">
                  <div><p className="text-xs text-muted-foreground">جزئیات سفارش</p><h2 className="mt-1 text-xl font-extrabold">سفارش #{numberFormat.format(selected.docNo)}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.date}</p></div>
                  <Button variant="outline" size="sm" onClick={() => setSelected(null)}>بستن</Button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-muted-foreground">مشتری</p><p className="mt-1 font-semibold">{selected.customerMobile || selected.customerId || "نامشخص"}</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-muted-foreground">روش پرداخت</p><p className="mt-1 font-semibold">{selected.paymentMethodName}</p></div>
                </div>

                {selected.address && (
                  <div className="mt-3 rounded-xl border p-4">
                    <p className="font-bold">آدرس تحویل</p>
                    <p className="mt-2 text-sm">{selected.address.recipient} - {selected.address.mobile}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{selected.address.address}</p>
                    {selected.address.postalCode && <p className="mt-1 text-xs text-muted-foreground">کد پستی: {selected.address.postalCode}</p>}
                  </div>
                )}

                <div className="mt-5">
                  <h3 className="mb-3 font-bold">اقلام سفارش</h3>
                  <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead className="bg-slate-50 text-right text-muted-foreground"><tr><th className="p-3">کالا</th><th className="p-3">تعداد</th><th className="p-3">قیمت واحد</th><th className="p-3">مبلغ</th></tr></thead>
                      <tbody>{selected.items.map((item) => <tr key={item.id} className="border-t"><td className="p-3"><p className="font-semibold">{item.name || `کالا ${item.goodId}`}</p><p className="text-xs text-muted-foreground">{item.code}</p></td><td className="p-3">{numberFormat.format(item.quantity)}</td><td className="p-3">{money(item.unitPrice)}</td><td className="p-3 font-bold">{money(item.totalPrice)}</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
                  <div><p className="text-xs text-muted-foreground">مبلغ کل</p><p className="mt-1 font-bold">{money(selected.totalPrice)}</p></div>
                  <div><p className="text-xs text-muted-foreground">تخفیف</p><p className="mt-1 font-bold">{money(selected.discountPrice)}</p></div>
                  <div><p className="text-xs text-muted-foreground">قابل پرداخت</p><p className="mt-1 text-lg font-extrabold">{money(selected.payablePrice)} تومان</p></div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold">وضعیت ارسال
                    <select value={deliveryDraft} onChange={(event) => setDeliveryDraft(event.target.value)} className="h-11 w-full rounded-xl border bg-white px-3 font-normal">
                      {result.statuses.delivery.map((status) => <option key={status.RowID} value={status.RowID}>{status.RowName}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-semibold">وضعیت پرداخت
                    <select value={paymentDraft} onChange={(event) => setPaymentDraft(event.target.value)} className="h-11 w-full rounded-xl border bg-white px-3 font-normal">
                      {result.statuses.payment.map((status) => <option key={status.RowID} value={status.RowID}>{status.RowName}</option>)}
                    </select>
                  </label>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelected(null)}>انصراف</Button>
                  <Button disabled={busy === selected.id || (!deliveryDraft && !paymentDraft)} onClick={() => void saveStatuses()}>
                    <PackageCheck className="ml-2 size-4" /> {busy === selected.id ? "در حال ذخیره..." : "ذخیره وضعیت‌ها"}
                  </Button>
                </div>
                <p className="mt-3 text-xs leading-6 text-amber-700">تغییر وضعیت پرداخت یا ارسال فقط وضعیت ثبت‌شده سفارش را به‌روزرسانی می‌کند و به‌معنای برگشت وجه یا اصلاح موجودی انبار نیست.</p>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
