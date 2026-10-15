import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ProductGrid } from "../components/ProductGrid";
import { ProductGridSkeleton } from "../components/ProductGridSkeleton";
import { useProducts } from "../hooks/useProducts";
import { getApiAssetUrl } from "@/lib/api-url";
import { Slider } from "@/features/slider/slider";
import { Category } from "@/features/categories/categories";

export function HomePage() {
  const { data, isLoading, isError, refetch } = useProducts({
    page: 1,
    limit: 8,
  });
  const heroProduct = data?.products[0];
  const heroImage =
    heroProduct?.images.find((image) => image.isDefault) ??
    heroProduct?.images[0];

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:pb-14 sm:pt-10">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#103d32] text-white shadow-2xl shadow-emerald-950/10">
          <div className="absolute -left-24 -top-28 -z-10 size-96 rounded-full bg-emerald-400/15 blur-3xl" />
          <Slider />
        </div>
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:pb-14">
            <Category />
        </section>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 bg-[#EBFCEB] p-5 rounded-3xl">
          {[
            {
              icon: Truck,
              title: "ارسال سریع و مطمئن",
              description: "سفارش‌هایت را با خیال راحت تحویل بگیر.",
            },
            {
              icon: ShieldCheck,
              title: "خریدی امن",
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
              className="flex items-center gap-4 rounded-2xl border border-emerald-950/5 bg-white p-4 sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary">
              منتخب فروشگاه
            </span>
            <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
              محصولات پیشنهادی
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              چند انتخاب دوست‌داشتنی برای شروع خرید
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2"
          >
            همه محصولات
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/20 bg-white p-8 text-center">
            <p className="font-semibold">دریافت محصولات با خطا مواجه شد.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => void refetch()}
            >
              تلاش دوباره
            </Button>
          </div>
        ) : data?.products.length ? (
          <ProductGrid products={data.products} />
        ) : (
          <div className="rounded-2xl border bg-white p-8 text-center text-muted-foreground">
            هنوز محصولی برای نمایش وجود ندارد.
          </div>
        )}
      </section>
    </div>
  );
}
