import { useCallback, useEffect, useState } from "react";
import { Headset, RefreshCw, ExternalLink, Save, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminOrderRequests,
  updateAdminOrderRequest,
  type AdminOrderRequest,
} from "@/features/admin/services/admin-order-requests.api";

const numberFormat = new Intl.NumberFormat("fa-IR");
const statusLabel: Record<number, string> = {
  1: "ثبت‌شده",
  2: "در حال بررسی",
  3: "پاسخ داده‌شده",
  4: "رد شده",
};

export function AdminOrderRequestsPage() {
  const [items, setItems] = useState<AdminOrderRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [statuses, setStatuses] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminOrderRequests(filter === "all" ? undefined : Number(filter));
      setItems(result.items);
      setResponses(Object.fromEntries(result.items.map((item) => [item.id, item.adminResponse || ""])));
      setStatuses(Object.fromEntries(result.items.map((item) => [item.id, item.status])));
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت درخواست‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  async function save(item: AdminOrderRequest) {
    setBusy(item.id);
    setError(null);
    setNotice(null);
    try {
      await updateAdminOrderRequest(item.id, statuses[item.id] ?? item.status, responses[item.id] ?? "");
      setNotice("پاسخ و وضعیت درخواست ذخیره شد.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره درخواست ناموفق بود.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section dir="rtl" className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-800"><Headset className="size-5" /><span className="text-sm font-semibold">خدمات مشتریان</span></div>
          <h1 className="mt-2 text-2xl font-extrabold">درخواست‌ها و پشتیبانی</h1>
          <p className="mt-1 text-sm text-muted-foreground">درخواست‌های لغو و پیام‌های پشتیبانی مشتریان را بررسی کن.</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className="ml-2 size-4" /> بروزرسانی</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[["all", "همه"], ["1", "ثبت‌شده"], ["2", "در حال بررسی"], ["3", "پاسخ داده‌شده"], ["4", "رد شده"]].map(([value, label]) => (
          <Button key={value} size="sm" variant={filter === value ? "default" : "outline"} onClick={() => setFilter(value)}>{label}</Button>
        ))}
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

      {loading ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-muted-foreground">در حال دریافت درخواست‌ها...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-muted-foreground">درخواستی در این بخش وجود ندارد.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{item.requestType === 1 ? "درخواست لغو سفارش" : "پشتیبانی"}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{statusLabel[item.status]}</span>
                  </div>
                  <h2 className="mt-3 font-extrabold">سفارش #{numberFormat.format(item.orderDocNo)}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{item.orderDate} · {item.customerName || "مشتری"} · {item.customerMobile || "بدون شماره"}</p>
                </div>
                <Link to={`/admin/orders`} className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                  مشاهده سفارش <ExternalLink className="size-4" />
                </Link>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-xs font-bold text-slate-500"><MessageSquareText className="size-4" /> متن مشتری</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">{item.message || "درخواست لغو بدون توضیح"}</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr]">
                <label className="space-y-2 text-sm font-semibold">وضعیت درخواست
                  <select value={statuses[item.id] ?? item.status} onChange={(event) => setStatuses((current) => ({ ...current, [item.id]: Number(event.target.value) }))} className="h-11 w-full rounded-xl border bg-white px-3 font-normal">
                    <option value={1}>ثبت‌شده</option>
                    <option value={2}>در حال بررسی</option>
                    <option value={3}>پاسخ داده‌شده</option>
                    <option value={4}>رد شده</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-semibold">پاسخ برای مشتری
                  <Textarea rows={2} maxLength={1000} value={responses[item.id] ?? ""} onChange={(event) => setResponses((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="پاسخ یا توضیحی که مشتری در پیگیری سفارش می‌بیند..." />
                </label>
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={() => void save(item)} disabled={busy === item.id}><Save className="ml-2 size-4" /> {busy === item.id ? "در حال ذخیره..." : "ذخیره پاسخ و وضعیت"}</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
