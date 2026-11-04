import { useCallback, useEffect, useState } from "react";
import { Building2, CreditCard, RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  getAdminBankAccounts,
  updateAdminBankAccountVisibility,
  type AdminBankAccount,
} from "../services/admin-bank-accounts.api";

export function AdminBankAccountsPage() {
  const [accounts, setAccounts] = useState<AdminBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminBankAccounts();
      setAccounts(data);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      setError(message || "دریافت حساب‌های بانکی ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  async function handleToggle(account: AdminBankAccount) {
    const currentVisibility = account.OnlineShop_IsShow === true;
    const nextVisibility = !currentVisibility;

    if (nextVisibility && !account.IsActive) {
      setError("این حساب در حسابداری غیرفعال است و امکان نمایش آن وجود ندارد.");
      return;
    }

    setBusyId(account.RowID);
    setError("");

    try {
      const updated = await updateAdminBankAccountVisibility(
        account.RowID,
        nextVisibility,
      );

      setAccounts((current) =>
        current.map((item) => (item.RowID === updated.RowID ? updated : item)),
      );
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      setError(message || "تغییر وضعیت حساب بانکی انجام نشد.");
    } finally {
      setBusyId(null);
    }
  }

  const visibleCount = accounts.filter(
    (item) => item.IsActive && item.OnlineShop_IsShow === true,
  ).length;

  return (
    <section dir="rtl" className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <Building2 className="size-5" />
            <span className="text-sm font-bold">تنظیمات فروشگاه</span>
          </div>

          <h1 className="mt-2 text-2xl font-black text-slate-900">
            مدیریت کارت‌ها و حساب‌های بانکی
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            حساب‌هایی را که مشتری هنگام پرداخت می‌بیند انتخاب کن.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadAccounts()}
          disabled={loading}
        >
          <RefreshCw className="ml-2 size-4" />
          بروزرسانی
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm text-slate-500">کل حساب‌ها</p>
          <p className="mt-2 text-2xl font-black">{accounts.length}</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">قابل نمایش در فروشگاه</p>
          <p className="mt-2 text-2xl font-black text-emerald-800">
            {visibleCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">مخفی از فروشگاه</p>
          <p className="mt-2 text-2xl font-black text-slate-700">
            {accounts.length - visibleCount}
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
          در حال دریافت حساب‌های بانکی...
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
          حساب بانکی‌ای در دیتابیس پیدا نشد.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => {
            const isShown = account.OnlineShop_IsShow === true;
            const isBusy = busyId === account.RowID;
            const canEnable = account.IsActive;

            return (
              <div
                key={account.RowID}
                className={`rounded-2xl border bg-white p-5 transition ${
                  isShown && account.IsActive
                    ? "border-emerald-200 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <CreditCard className="size-6" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-slate-900">
                        {account.OnlineShop_BankName ||
                          account.RowName ||
                          "حساب بانکی"}
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        کد حساب: {account.RowCode || account.RowID}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      isShown && account.IsActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isShown && account.IsActive ? "نمایش در فروشگاه" : "مخفی"}
                  </span>
                </div>

                <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">شماره کارت</span>
                    <span className="font-semibold text-slate-800" dir="ltr">
                      {account.OnlineShop_CardNumber || "ثبت نشده"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">شماره حساب</span>
                    <span className="font-semibold text-slate-800" dir="ltr">
                      {account.OnlineShop_AccountNumber || "ثبت نشده"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">صاحب حساب</span>
                    <span className="font-semibold text-slate-800">
                      {account.OnlineShop_AccountOwnerName || "ثبت نشده"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      نمایش در فروشگاه
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {!account.IsActive
                        ? "این حساب در حسابداری غیرفعال است."
                        : isShown
                          ? "مشتری این حساب را می‌بیند."
                          : "این حساب برای مشتری مخفی است."}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isShown}
                    aria-label={`تغییر نمایش ${account.RowName || account.RowID}`}
                    disabled={isBusy || (!canEnable && !isShown)}
                    onClick={() => void handleToggle(account)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      isShown ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${
                        isShown ? "right-1" : "right-6"
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
          وضعیت حسابداری فقط خواندنی است. این صفحه صرفاً نمایش حساب را در
          فروشگاه کنترل می‌کند. برای نمایش حساب، نام بانک، نام صاحب حساب و حداقل
          یکی از شماره کارت یا شماره حساب باید ثبت شده باشد.
        </p>
      </div>
    </section>
  );
}
