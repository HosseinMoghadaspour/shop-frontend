import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, ShieldCheck, Sparkles, Flame, Clock, TrendingUp, Truck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ProductGrid } from "../components/ProductGrid";
import { ProductGridSkeleton } from "../components/ProductGridSkeleton";
import {
  getAmazingProducts,
  getBestSellingProducts,
  getNewProducts,
  getProducts,
  type Product,
} from "@/services/products.api";
import { Slider } from "@/features/slider/slider";
import { Category } from "@/features/categories/categories";
import { useCartStore } from "@/stores/cart.store";

function ProductSection({
  eyebrow,
  title,
  description,
  products,
  isLoading,
  isError,
  onRetry,
  theme = "plain",
  icon: SectionIcon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  products: Product[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  theme?: "plain" | "amazing" | "new" | "best" | "sug";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const sectionTheme = {
    plain: {
      wrapper: "bg-white/50 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-6 shadow-sm",
      eyebrow: "text-primary bg-primary/10 px-3 py-1 rounded-full",
      description: "text-muted-foreground",
      link: "text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl",
      iconColor: "text-primary bg-primary/10",
    },
    amazing: {
      wrapper: "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-500/10 via-red-500/5 to-amber-500/10 border border-rose-200/60 p-5 sm:p-8 shadow-xl shadow-rose-950/5 backdrop-blur-md",
      eyebrow: "text-rose-700 bg-rose-100/80 px-3 py-1 rounded-full shadow-inner",
      description: "text-rose-950/70",
      link: "text-rose-700 bg-rose-100/60 hover:bg-rose-200/80 px-3.5 py-1.5 rounded-xl shadow-sm",
      iconColor: "text-rose-600 bg-rose-100",
    },
    new: {
      wrapper: "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-cyan-500/10 border border-sky-200/60 p-5 sm:p-8 shadow-xl shadow-sky-950/5 backdrop-blur-md",
      eyebrow: "text-sky-800 bg-sky-100/80 px-3 py-1 rounded-full shadow-inner",
      description: "text-slate-700",
      link: "text-sky-800 bg-sky-100/60 hover:bg-sky-200/80 px-3.5 py-1.5 rounded-xl shadow-sm",
      iconColor: "text-sky-600 bg-sky-100",
    },
    best: {
      wrapper: "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border border-violet-200/60 p-5 sm:p-8 shadow-xl shadow-violet-950/5 backdrop-blur-md",
      eyebrow: "text-violet-800 bg-violet-100/80 px-3 py-1 rounded-full shadow-inner",
      description: "text-slate-700",
      link: "text-violet-800 bg-violet-100/60 hover:bg-violet-200/80 px-3.5 py-1.5 rounded-xl shadow-sm",
      iconColor: "text-violet-600 bg-violet-100",
    },
    sug: {
      wrapper: "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-cyan-500/10 border border-teal-200/60 p-5 sm:p-8 shadow-xl shadow-teal-950/5 backdrop-blur-md",
      eyebrow: "text-teal-800 bg-teal-100/80 px-3 py-1 rounded-full shadow-inner",
      description: "text-slate-700",
      link: "text-teal-800 bg-teal-100/60 hover:bg-teal-200/80 px-3.5 py-1.5 rounded-xl shadow-sm",
      iconColor: "text-teal-600 bg-teal-100",
    },
  }[theme];

  return (
    <section className={sectionTheme.wrapper}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0 flex items-start gap-3.5">
          {SectionIcon && (
            <span className={`flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${sectionTheme.iconColor}`}>
              <SectionIcon className="size-6" />
            </span>
          )}
          <div>
            <div className="inline-block mb-1.5">
              <span className={`text-xs font-extrabold tracking-wide ${sectionTheme.eyebrow}`}>
                {eyebrow}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight sm:text-3xl text-slate-900">{title}</h2>
            <p className={`mt-1 text-xs sm:text-sm font-medium ${sectionTheme.description}`}>
              {description}
            </p>
          </div>
        </div>
        <Link
          to="/products"
          className={`inline-flex shrink-0 items-center justify-center gap-1.5 text-xs font-bold transition-all hover:gap-2 sm:text-sm ${sectionTheme.link}`}
        >
          <span>مشاهده همه</span>
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={5} horizontal={theme !== "plain"} />
      ) : isError ? (
        <div
          className={`rounded-2xl p-8 text-center backdrop-blur-md ${theme === "plain" ? "border border-destructive/20 bg-white" : "bg-white/80 border border-white/50"}`}
        >
          <p className="text-sm font-bold text-slate-700">
            دریافت محصولات این بخش با خطا مواجه شد.
          </p>
          <Button variant="outline" className="mt-4 rounded-xl shadow-sm" onClick={onRetry}>
            تلاش دوباره
          </Button>
        </div>
      ) : products?.length ? (
        <ProductGrid products={products} horizontal={theme !== "plain"} />
      ) : (
        <div
          className={`rounded-2xl p-8 text-center text-sm font-medium ${theme === "plain" ? "border bg-white text-muted-foreground" : "bg-white/60 text-slate-600 border border-white/40"}`}
        >
          فعلاً محصولی برای نمایش در این بخش وجود ندارد.
        </div>
      )}
    </section>
  );
}

export function HomePage() {
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const recommendedQuery = useQuery({
    queryKey: ["products", "homepage-recommended"],
    queryFn: () => getProducts({ page: 1, limit: 10 }),
  });
  const amazingQuery = useQuery({
    queryKey: ["products", "amazing", 12],
    queryFn: () => getAmazingProducts(12),
  });
  const newQuery = useQuery({
    queryKey: ["products", "new", 12],
    queryFn: () => getNewProducts(12),
  });
  const bestSellingQuery = useQuery({
    queryKey: ["products", "best-selling", 12],
    queryFn: () => getBestSellingProducts(12),
  });

  return (
    <div className="pb-16 min-h-screen">
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-4 sm:pb-10 sm:pt-6">
        {/* اسلایدر اصلی */}
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white shadow-2xl shadow-emerald-950/20 ring-1 ring-white/10 sm:rounded-[2.5rem]">
          <Slider />
        </div>

        {/* دسته‌بندی‌ها */}
        <div className="py-6 sm:py-8">
          <Category />
        </div>

        {/* باکس‌های اعتماد و مزایای خرید */}
        <div className="grid grid-cols-1 gap-3.5 rounded-[2.5rem] bg-gradient-to-r from-emerald-100/70 via-teal-100/70 to-cyan-100/70 p-4 sm:grid-cols-3 sm:gap-5 sm:p-6 shadow-lg shadow-emerald-900/5 ring-1 ring-emerald-900/10 backdrop-blur-md">
          {[
            {
              icon: Truck,
              title: "ارسال سریع و مطمئن",
              description: "سفارش‌هایت را با خیال راحت تحویل بگیر.",
            },
            {
              icon: ShieldCheck,
              title: "خریدی امن و تضمین‌شده",
              description: "از ثبت سفارش تا تحویل، همراه شماییم.",
            },
            {
              icon: BadgeCheck,
              title: "انتخاب‌های باکیفیت",
              description: "برای یک خرید رضایت‌بخش و به‌یادماندنی.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-center gap-4 rounded-3xl bg-white/90 p-4 sm:p-5 shadow-sm shadow-emerald-900/5 ring-1 ring-emerald-900/5 transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-md"
            >
              <span className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/30">
                <Icon className="size-6" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 font-medium">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* بخش‌های محصولات با طراحی کارت‌های جذاب و شیشه‌ای */}
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:space-y-16">
        <ProductSection
          eyebrow="تخفیف‌های ویژه روز"
          title="پیشنهاد شگفت‌انگیز"
          description="فرصت‌های محدودی که ارزش دیدن و خریدن دارند"
          products={amazingQuery.data}
          isLoading={amazingQuery.isLoading}
          isError={amazingQuery.isError}
          onRetry={() => void amazingQuery.refetch()}
          theme="amazing"
          icon={Flame}
        />

        <ProductSection
          eyebrow="تازه‌های فروشگاه"
          title="جدیدترین محصولات"
          description="آخرین کالاهای جذاب و باکیفیت اضافه‌شده"
          products={newQuery.data}
          isLoading={newQuery.isLoading}
          isError={newQuery.isError}
          onRetry={() => void newQuery.refetch()}
          theme="new"
          icon={Clock}
        />

        <ProductSection
          eyebrow="محبوب‌ترین انتخاب‌ها"
          title="پرفروش‌ترین محصولات"
          description="محصولاتی که بیشترین رضایت و خرید را داشته‌اند"
          products={bestSellingQuery.data}
          isLoading={bestSellingQuery.isLoading}
          isError={bestSellingQuery.isError}
          onRetry={() => void bestSellingQuery.refetch()}
          theme="best"
          icon={TrendingUp}
        />

        <ProductSection
          eyebrow="پیشنهاد ویژه شما"
          title="محصولات پیشنهادی"
          description="گلچین‌شده‌های ما برای یک شروع خرید عالی"
          products={recommendedQuery.data?.products}
          isLoading={recommendedQuery.isLoading}
          isError={recommendedQuery.isError}
          onRetry={() => void recommendedQuery.refetch()}
          theme="sug"
          icon={Sparkles}
        />
      </div>
    </div>
  );
}
