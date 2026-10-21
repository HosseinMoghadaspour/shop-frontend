import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpLeft,
  CheckCircle2,
  CircleAlert,
  Eye,
  FolderTree,
  ImagePlus,
  Package,
  PackageSearch,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminDashboardStats, type AdminDashboardStats } from "@/features/admin/services/admin-dashboard.api";

const numberFormat = new Intl.NumberFormat("fa-IR");

const initialStats: AdminDashboardStats = {
  products: { total: 0, visible: 0, hidden: 0 },
  categories: { total: 0, visible: 0, hidden: 0 },
};

function StatCard({ title, value, caption, icon: Icon, tone }: {
  title: string;
  value: number;
  caption: string;
  icon: typeof Package;
  tone: "green" | "blue" | "amber" | "violet";
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    blue: "bg-sky-50 text-sky-800 ring-sky-100",
    amber: "bg-amber-50 text-amber-800 ring-amber-100",
    violet: "bg-violet-50 text-violet-800 ring-violet-100",
  };
  return (
    <Card className="border-slate-200/80 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{numberFormat.format(value)}</p>
          </div>
          <span className={`flex size-12 items-center justify-center rounded-2xl ring-1 ${tones[tone]}`}><Icon className="size-5" /></span>
        </div>
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">{caption}</p>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDashboardStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت آمار داشبورد ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadStats(); }, [loadStats]);

  const quickActions = [
    { title: "مدیریت کالاها", description: "بارگذاری تصویر، انتخاب تصویر اصلی و کنترل نمایش کالاها", to: "/admin/products", icon: PackageSearch, tag: "کالاها", tint: "bg-emerald-50 text-emerald-800" },
    { title: "دسته‌بندی‌های فروشگاه", description: "تنظیم آیکون، ترتیب و وضعیت نمایش دسته‌بندی‌ها", to: "/admin/categories", icon: FolderTree, tag: "دسته‌بندی", tint: "bg-sky-50 text-sky-800" },
  ];

  return (
    <main dir="rtl" className="min-h-[calc(100vh-72px)] bg-[#f5f8f6] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
      <div className="mx-auto max-w-[1500px] space-y-7">

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            {loading && <span className="text-xs text-slate-500">در حال دریافت آمار…</span>}
          </div>
          {error ? (
            <Card className="border-amber-200 bg-amber-50/70"><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" /><div><p className="font-bold text-amber-950">آمار فعلاً بارگذاری نشد</p><p className="mt-1 text-sm leading-6 text-amber-900/80">{error}</p></div></div><Button variant="outline" onClick={() => void loadStats()}><RefreshCw className="ml-2 size-4" /> تلاش دوباره</Button></CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="کل کالاها" value={stats.products.total} caption={`${numberFormat.format(stats.products.visible)} کالا در سایت نمایش داده می‌شود`} icon={Package} tone="green" />
              <StatCard title="کالاهای مخفی" value={stats.products.hidden} caption="کالاهایی که در سایت نمایش ندارند" icon={Eye} tone="amber" />
              <StatCard title="کل دسته‌بندی‌ها" value={stats.categories.total} caption={`${numberFormat.format(stats.categories.visible)} دسته‌بندی قابل نمایش است`} icon={FolderTree} tone="blue" />
              <StatCard title="دسته‌بندی‌های مخفی" value={stats.categories.hidden} caption="قابل بررسی در مدیریت دسته‌بندی‌ها" icon={ShoppingBag} tone="violet" />
            </div>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
          <div>
            <div className="mb-4"><h2 className="text-lg font-extrabold">دسترسی سریع</h2><p className="mt-1 text-sm text-slate-500">بخش‌هایی که بیشتر استفاده می‌کنید</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              {quickActions.map(({ title, description, to, icon: Icon, tag, tint }) => (
                <Link key={to} to={to} className="group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
                  <Card className="h-full border-slate-200/80 shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:border-emerald-200 group-hover:shadow-lg group-hover:shadow-emerald-950/[0.04]">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3"><span className={`flex size-12 items-center justify-center rounded-2xl ${tint}`}><Icon className="size-5" /></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{tag}</span></div>
                      <h3 className="mt-5 text-base font-extrabold">{title}</h3><p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">{description}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-800">ورود به بخش <ArrowLeft className="size-4 transition group-hover:-translate-x-1" /></span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* <div>
            <div className="mb-4"><h2 className="text-lg font-extrabold">راهنمای مدیریت</h2><p className="mt-1 text-sm text-slate-500">چند یادآوری کاربردی</p></div>
            <Card className="h-[calc(100%-52px)] border-slate-200/80 shadow-sm">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div className="flex gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><ImagePlus className="size-5" /></span><div><p className="text-sm font-bold">تصاویر کالاها</p><p className="mt-1 text-xs leading-6 text-slate-500">برای نمایش بهتر کالاها، تصویر مناسب بارگذاری کنید و تصویر اصلی هر کالا را مشخص کنید.</p></div></div>
                <div className="flex gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800"><FolderTree className="size-5" /></span><div><p className="text-sm font-bold">دسته‌بندی‌ها</p><p className="mt-1 text-xs leading-6 text-slate-500">آیکون، ترتیب و وضعیت نمایش را تنظیم کنید. نام و کد اصلی از سیستم حسابداری می‌آید.</p></div></div>
                <div className="flex gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><CheckCircle2 className="size-5" /></span><div><p className="text-sm font-bold">کنترل نمایش در سایت</p><p className="mt-1 text-xs leading-6 text-slate-500">پس از هر تغییر وضعیت، صفحه فروشگاه را بررسی کنید تا نتیجه درست نمایش داده شود.</p></div></div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-6 text-slate-500">آمار سفارش‌ها و فروش پس از ایجاد API مدیریتی سفارش‌ها به این داشبورد اضافه خواهد شد.</div>
              </CardContent>
            </Card>
          </div> */}
        </section>
      </div>
    </main>
  );
}
