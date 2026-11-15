import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  MapPin,
  MapPinned,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";
import { getMyAddresses, type DeliveryAddress } from "@/services/addresses.api";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAddresses() {
      try {
        setIsLoadingAddresses(true);
        setAddressError(null);
        const result = await getMyAddresses();
        if (mounted) setAddresses(result);
      } catch (error) {
        if (!mounted) return;
        setAddressError(
          error instanceof Error ? error.message : "دریافت آدرس‌ها با خطا مواجه شد.",
        );
      } finally {
        if (mounted) setIsLoadingAddresses(false);
      }
    }

    void loadAddresses();
    return () => {
      mounted = false;
    };
  }, []);

  const userName = user?.RowName?.trim() || "کاربر";
  const mobile = user?.MobileNumber || user?.MobileForSMS || user?.Mobile || "-";
  const activeAddressCount = addresses.filter((address) => address.isActive).length;

  return (
    <main dir="rtl" className="mx-auto min-h-[70vh] max-w-6xl px-4 py-6 sm:py-10">
      <header className="mb-7">
        <p className="text-sm font-bold text-emerald-700">ناحیه شخصی شما</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          حساب کاربری
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          اطلاعات حساب، سفارش‌ها و نشانی‌های تحویل را از این قسمت مدیریت کنید.
        </p>
      </header>

      <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-800 p-5 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
        <div className="pointer-events-none absolute -left-12 -top-20 size-64 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 size-56 rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-inner sm:size-20">
              <UserRound className="size-8 text-emerald-100 sm:size-10" />
            </div>
            <div className="min-w-0">
              <Badge className="mb-2 border border-emerald-200/20 bg-emerald-300/15 text-emerald-50 hover:bg-emerald-300/15">
                <ShieldCheck className="ml-1 size-3.5" />
                حساب فعال
              </Badge>
              <h2 className="truncate text-xl font-extrabold sm:text-2xl">{userName}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-emerald-100/80">
                <Phone className="size-4" />
                <span dir="ltr">{mobile}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-64">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-emerald-100/75">آدرس‌های فعال</p>
              <p className="mt-1 text-2xl font-black tabular-nums">
                {isLoadingAddresses ? "—" : activeAddressCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-emerald-100/75">وضعیت حساب</p>
              <p className="mt-1 text-base font-bold">تأیید شده</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link
          to="/orders"
          className="group rounded-2xl outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <Card className="h-full border-slate-200/80 shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:border-emerald-200 group-hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <ClipboardList className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold text-slate-900">سفارش‌های من</span>
                <span className="mt-1 block text-xs text-slate-500">مشاهده و پیگیری سفارش‌ها</span>
              </span>
              <ArrowLeft className="size-4 text-slate-400 transition group-hover:-translate-x-1 group-hover:text-emerald-700" />
            </CardContent>
          </Card>
        </Link>

        <Link
          to="/delivery-address"
          className="group rounded-2xl outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <Card className="h-full border-slate-200/80 shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:border-emerald-200 group-hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <MapPinned className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold text-slate-900">مدیریت آدرس‌ها</span>
                <span className="mt-1 block text-xs text-slate-500">افزودن یا مدیریت نشانی تحویل</span>
              </span>
              <ArrowLeft className="size-4 text-slate-400 transition group-hover:-translate-x-1 group-hover:text-emerald-700" />
            </CardContent>
          </Card>
        </Link>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">آدرس‌های تحویل</h2>
            <p className="mt-1 text-xs text-slate-500">نشانی‌هایی که برای دریافت سفارش ثبت کرده‌اید</p>
          </div>
          <Link
            to="/delivery-address"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
          >
            مدیریت آدرس‌ها
            <ArrowLeft className="size-3.5" />
          </Link>
        </div>

        {isLoadingAddresses && (
          <div className="grid gap-3 sm:grid-cols-2" aria-label="در حال دریافت آدرس‌ها">
            {[0, 1].map((item) => (
              <div key={item} className="space-y-3 rounded-2xl border bg-white p-5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {!isLoadingAddresses && addressError && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertDescription>{addressError}</AlertDescription>
          </Alert>
        )}

        {!isLoadingAddresses && !addressError && addresses.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <MapPin className="size-7" />
            </span>
            <h3 className="mt-4 font-extrabold text-slate-900">هنوز آدرسی ثبت نکرده‌اید</h3>
            <p className="mt-2 text-sm text-slate-500">
              برای ثبت سفارش سریع‌تر، اولین نشانی تحویل خود را اضافه کنید.
            </p>
            <Link
              to="/delivery-address"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              ثبت آدرس جدید
            </Link>
          </div>
        )}

        {!isLoadingAddresses && !addressError && addresses.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((address) => (
              <article
                key={address.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <MapPin className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900">
                        {address.recipient.name || "تحویل گیرنده"}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">گیرنده سفارش</p>
                    </div>
                  </div>
                  {address.isActive && (
                    <Badge className="shrink-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      فعال
                    </Badge>
                  )}
                </div>

                <p className="text-xs leading-6 text-slate-500">
                  {[address.province?.name, address.county?.name, address.city?.name]
                    .filter(Boolean)
                    .join(" / ") || "محدوده ثبت نشده"}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-800">{address.address || "آدرس ثبت نشده"}</p>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>کد پستی: {address.postalCode || "—"}</span>
                  <span dir="ltr">{address.recipient.mobile || "—"}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
