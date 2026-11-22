import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  Flame,
  Clock,
  TrendingUp,
  Truck,
} from "lucide-react";
import {
  getAmazingProducts,
  getBestSellingProducts,
  getNewProducts,
  getProducts,
} from "@/services/products.api";
import { Slider } from "@/features/slider/slider";
import { Category } from "@/features/categories/categories";
import { useCartStore } from "@/stores/cart.store";
import { useSelectedBranchId } from "@/hooks/useSelectedBranchId";

import { PageLoader } from "@/components/ui/PageLoader";
import { ProductSection } from "../components/ProductSection";



export function HomePage() {
  const fetchCart = useCartStore((state) => state.fetchCart);
  const branchId = useSelectedBranchId();

  useEffect(() => {
    void fetchCart();
  }, [fetchCart, branchId]);

  const recommendedQuery = useQuery({
    queryKey: ["products", "homepage-recommended", branchId],
    queryFn: () => getProducts({ page: 1, limit: 10 }),
  });
  const amazingQuery = useQuery({
    queryKey: ["products", "amazing", 12, branchId],
    queryFn: () => getAmazingProducts(12),
  });
  const newQuery = useQuery({
    queryKey: ["products", "new", 12, branchId],
    queryFn: () => getNewProducts(12),
  });
  const bestSellingQuery = useQuery({
    queryKey: ["products", "best-selling", 12, branchId],
    queryFn: () => getBestSellingProducts(12),
  });

  // The branded full-screen loader is reserved for the initial homepage load.
  if (
    recommendedQuery.isLoading &&
    amazingQuery.isLoading &&
    newQuery.isLoading &&
    bestSellingQuery.isLoading
  ) {
    return <PageLoader label="در حال آماده‌سازی فروشگاه..." />;
  }

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
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {title}
                </h3>
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
