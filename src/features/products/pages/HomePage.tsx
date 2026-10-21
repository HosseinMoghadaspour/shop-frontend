import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, ShieldCheck, Truck } from "lucide-react";
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
}: {
  eyebrow: string;
  title: string;
  description: string;
  products: Product[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  theme?: "plain" | "amazing" | "new" | "best";
}) {
  const sectionTheme = {
    plain: { wrapper: "", eyebrow: "text-primary", description: "text-muted-foreground", link: "text-primary" },
    amazing: { wrapper: "rounded-[2rem] bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100/80 px-4 py-6 sm:px-6 sm:py-8", eyebrow: "text-rose-700", description: "text-rose-950/65", link: "text-rose-700" },
    new: { wrapper: "rounded-[2rem] bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-100/80 px-4 py-6 sm:px-6 sm:py-8", eyebrow: "text-sky-800", description: "text-slate-600", link: "text-sky-800" },
    best: { wrapper: "rounded-[2rem] bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100/80 px-4 py-6 sm:px-6 sm:py-8", eyebrow: "text-violet-800", description: "text-slate-600", link: "text-violet-800" },
  }[theme];

  return (
    <section className={sectionTheme.wrapper}>
      <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6">
        <div className="min-w-0">
          <span className={`text-xs font-bold ${sectionTheme.eyebrow}`}>
            {eyebrow}
          </span>
          <h2 className="mt-1 text-lg font-extrabold sm:text-2xl">{title}</h2>
          <p className={`mt-1 text-xs sm:text-sm ${sectionTheme.description}`}>
            {description}
          </p>
        </div>
        <Link
          to="/products"
          className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition hover:gap-2 sm:text-sm ${sectionTheme.link}`}
        >
          همه محصولات <ArrowLeft className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={5} />
      ) : isError ? (
        <div className={`rounded-2xl p-6 text-center ${theme === "plain" ? "border border-destructive/20 bg-white" : "bg-white/75"}`}>
          <p className="text-sm font-semibold">دریافت محصولات این بخش با خطا مواجه شد.</p>
          <Button variant="outline" className="mt-3" onClick={onRetry}>تلاش دوباره</Button>
        </div>
      ) : products?.length ? (
        <ProductGrid products={products} horizontal={theme !== "plain"} />
      ) : (
        <div className={`rounded-2xl p-6 text-center text-sm ${theme === "plain" ? "border bg-white text-muted-foreground" : "bg-white/65 text-slate-600"}`}>
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
    <div className="pb-10">
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-5 sm:pb-12 sm:pt-8">
        <div className="relative isolate overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 text-white shadow-xl shadow-emerald-950/15 sm:rounded-[2rem]">
          <Slider />
        </div>

        <div className="py-5 sm:py-7">
          <Category />
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-3 sm:grid-cols-3 sm:gap-4 sm:p-5">
          {[
            { icon: Truck, title: "ارسال سریع و مطمئن", description: "سفارش‌هایت را با خیال راحت تحویل بگیر." },
            { icon: ShieldCheck, title: "خریدی امن", description: "از ثبت سفارش تا تحویل، همراه شماییم." },
            { icon: BadgeCheck, title: "انتخاب‌های باکیفیت", description: "برای یک خرید رضایت‌بخش و به‌یادماندنی." },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl border-0 bg-white/90 p-3 shadow-sm shadow-emerald-900/5 ring-1 ring-emerald-900/5 sm:gap-4 sm:p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 sm:size-11">
                <Icon className="size-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:space-y-14">
        <ProductSection
          eyebrow="فرصت محدود خرید"
          title="شگفت‌انگیزها"
          description="پیشنهادهای ویژه‌ای که ارزش دیدن دارند"
          products={amazingQuery.data}
          isLoading={amazingQuery.isLoading}
          isError={amazingQuery.isError}
          onRetry={() => void amazingQuery.refetch()}
          theme="amazing"
        />

        <ProductSection
          eyebrow="تازه رسیده‌اند"
          title="جدیدترین محصولات"
          description="آخرین کالاهای اضافه‌شده به فروشگاه"
          products={newQuery.data}
          isLoading={newQuery.isLoading}
          isError={newQuery.isError}
          onRetry={() => void newQuery.refetch()}
          theme="new"
        />

        <ProductSection
          eyebrow="محبوب مشتری‌ها"
          title="پرفروش‌ترین‌ها"
          description="محصولات مرتب‌شده بر اساس مقدار فروش ثبت‌شده"
          products={bestSellingQuery.data}
          isLoading={bestSellingQuery.isLoading}
          isError={bestSellingQuery.isError}
          onRetry={() => void bestSellingQuery.refetch()}
          theme="best"
        />

        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-700">منتخب فروشگاه</span>
              <h2 className="mt-1 text-lg font-extrabold sm:text-2xl">محصولات پیشنهادی</h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">چند انتخاب دوست‌داشتنی برای شروع خرید</p>
            </div>
            <Link to="/products" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition hover:gap-2 sm:text-sm">
              همه محصولات <ArrowLeft className="size-4" />
            </Link>
          </div>

          {recommendedQuery.isLoading ? (
            <ProductGridSkeleton />
          ) : recommendedQuery.isError ? (
            <div className="rounded-2xl border border-destructive/20 bg-white p-8 text-center">
              <p className="font-semibold">دریافت محصولات با خطا مواجه شد.</p>
              <Button variant="outline" className="mt-4" onClick={() => void recommendedQuery.refetch()}>تلاش دوباره</Button>
            </div>
          ) : recommendedQuery.data?.products.length ? (
            <ProductGrid products={recommendedQuery.data.products} />
          ) : (
            <div className="rounded-2xl border bg-white p-8 text-center text-muted-foreground">هنوز محصولی برای نمایش وجود ندارد.</div>
          )}
        </section>
      </div>
    </div>
  );
}
