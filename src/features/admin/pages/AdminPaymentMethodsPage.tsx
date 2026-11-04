import { useCallback, useEffect, useState } from "react";
import { CreditCard, RefreshCw, ShieldCheck, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getAdminPaymentMethods,
  updateAdminPaymentMethod,
  type AdminPaymentMethod,
} from "../services/admin-payment-methods.api";

export function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<AdminPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadMethods = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminPaymentMethods();
      setMethods(data);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      setError(message || "دریافت روش‌های پرداخت ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMethods();
  }, [loadMethods]);

  async function handleToggle(method: AdminPaymentMethod) {
    setBusyId(method.id);
    setError("");

    try {
      const updated = await updateAdminPaymentMethod(
        method.id,
        !method.isActive,
      );

      setMethods((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      setError(message || "تغییر وضعیت روش پرداخت انجام نشد.");
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = methods.filter((item) => item.isActive).length;

  return (
    <section dir="rtl" className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CreditCard className="size-5" />
            <span className="text-sm font-bold">تنظیمات فروشگاه</span>
          </div>

          <h1 className="mt-2 text-2xl font-black text-slate-900">
            مدیریت روش‌های پرداخت
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            روش‌های پرداخت قابل استفاده مشتریان را مدیریت کن.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadMethods()}
          disabled={loading}
        >
          <RefreshCw className="ml-2 size-4" />
          بروزرسانی
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm text-slate-500">کل روش‌ها</p>
          <p className="mt-2 text-2xl font-black">{methods.length}</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">روش‌های فعال</p>
          <p className="mt-2 text-2xl font-black text-emerald-800">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">روش‌های غیرفعال</p>
          <p className="mt-2 text-2xl font-black text-slate-700">
            {methods.length - activeCount}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">
          در حال دریافت روش‌های پرداخت...
        </div>
      ) : methods.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
          هیچ روش پرداختی در دیتابیس پیدا نشد.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {methods.map((method) => {
            const isBusy = busyId === method.id;

            return (
              <div
                key={method.id}
                className={`rounded-2xl border bg-white p-5 transition ${
                  method.isActive
                    ? "border-emerald-200 shadow-sm"
                    : "border-slate-200 opacity-80"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
                        method.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {method.onlinePayType ? (
                        <Wallet className="size-6" />
                      ) : (
                        <CreditCard className="size-6" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-slate-900">
                        {method.name}
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        شناسه: {method.id}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      method.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {method.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>

                {method.description && (
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    {method.description}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      نمایش در فروشگاه
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {method.isActive
                        ? "مشتری می‌تواند این روش را انتخاب کند."
                        : "این روش برای سفارش‌های جدید در دسترس نیست."}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={method.isActive}
                    aria-label={`تغییر وضعیت ${method.name}`}
                    disabled={isBusy}
                    onClick={() => void handleToggle(method)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-wait disabled:opacity-50 ${
                      method.isActive ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${
                        method.isActive ? "right-1" : "right-6"
                      }`}
                    />
                  </button>
                </div>

                {isBusy && (
                  <p className="mt-3 text-xs text-emerald-700">
                    در حال ذخیره تغییرات...
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
        <ShieldCheck className="mt-1 size-5 shrink-0" />
        <p>
          غیرفعال‌کردن یک روش پرداخت، سفارش‌های قبلی را تغییر نمی‌دهد؛ فقط
          انتخاب آن برای سفارش‌های جدید محدود می‌شود.
        </p>
      </div>
    </section>
  );
}
