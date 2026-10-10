import { ArrowLeft, ArrowUpLeft, BadgeCheck, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ProductGrid } from "../components/ProductGrid";
import { ProductGridSkeleton } from "../components/ProductGridSkeleton";
import { useProducts } from "../hooks/useProducts";
import { getApiAssetUrl } from "@/lib/api-url";
import { Slider } from "@/features/slider/slider";

export function HomePage() {
  const { data, isLoading, isError, refetch } = useProducts({
    page: 1,
    limit: 8,
  });
  const heroProduct = data?.products[0];
  const heroImage = heroProduct?.images.find((image) => image.isDefault)
    ?? heroProduct?.images[0];

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:pb-14 sm:pt-10">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#103d32] text-white shadow-2xl shadow-emerald-950/10">
          <div className="absolute -left-24 -top-28 -z-10 size-96 rounded-full bg-emerald-400/15 blur-3xl" />
          {/* <div className="absolute -bottom-36 right-1/3 -z-10 size-96 rounded-full bg-teal-300/10 blur-3xl" />
          <div className="grid min-h-[380px] items-center gap-6 px-6 py-10 sm:px-10 md:grid-cols-[1.1fr_0.9fr] md:px-14 md:py-12">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-emerald-50">
                <span className="size-2 rounded-full bg-lime-300" />
                تجربه‌ای تازه از خرید آنلاین
              </span>
              <h1 className="mt-6 max-w-xl text-3xl font-extrabold leading-[1.55] tracking-tight sm:text-4xl md:text-5xl">
                انتخاب‌های خوب،
                <span className="block text-emerald-200">خریدی آسوده‌تر.</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-emerald-50/75 sm:text-base">
                محصول دلخواهت را راحت پیدا کن، با خیال آسوده سفارش بده و در کوتاه‌ترین زمان تحویل بگیر.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-[#103d32] shadow-lg transition hover:bg-emerald-50"
                >
                  شروع خرید
                  <ArrowLeft className="mr-2 size-4" />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  دیدن همه محصولات
                  <ArrowUpLeft className="size-4" />
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-emerald-50/80">
                <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-200" /> خرید مطمئن</span>
                <span className="flex items-center gap-2"><Truck className="size-4 text-emerald-200" /> ارسال سریع</span>
                <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-emerald-200" /> کیفیت تضمین‌شده</span>
              </div>
            </div>

            <div className="relative mx-auto flex aspect-square w-full max-w-[360px] items-center justify-center">
              <div className="absolute inset-5 rounded-full border border-white/10" />
              <div className="absolute inset-12 rounded-full border border-white/10" />
              <div className="absolute size-56 rounded-full bg-white/10 blur-2xl sm:size-72" />
              {heroImage ? (
                <img
                  src={getApiAssetUrl(heroImage.url)}
                  alt={heroImage.alt || heroProduct?.name || "محصول منتخب"}
                  className="relative z-10 h-[78%] w-[78%] object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="relative z-10 flex size-48 items-center justify-center rounded-[2.5rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur sm:size-60">
                  <PackageCheck className="size-24 text-emerald-100/90" strokeWidth={1.2} />
                </div>
              )}
              {heroProduct && (
                <div className="absolute bottom-4 right-0 z-20 max-w-[190px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl sm:bottom-8">
                  <p className="line-clamp-1 text-xs text-emerald-100/75">پیشنهاد امروز</p>
                  <p className="mt-1 line-clamp-1 text-sm font-bold">{heroProduct.name}</p>
                </div>
              )}
            </div>
          </div> */}
          <Slider />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            { icon: Truck, title: "ارسال سریع و مطمئن", description: "سفارش‌هایت را با خیال راحت تحویل بگیر." },
            { icon: ShieldCheck, title: "خریدی امن", description: "از ثبت سفارش تا تحویل، همراه شماییم." },
            { icon: BadgeCheck, title: "انتخاب‌های باکیفیت", description: "برای یک خرید رضایت‌بخش و به‌یادماندنی." },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-center gap-4 rounded-2xl border border-emerald-950/5 bg-white p-4 sm:p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
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

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary">منتخب فروشگاه</span>
            <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">محصولات پیشنهادی</h2>
            <p className="mt-1 text-sm text-muted-foreground">چند انتخاب دوست‌داشتنی برای شروع خرید</p>
          </div>
          <Link to="/products" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2">
            همه محصولات
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/20 bg-white p-8 text-center">
            <p className="font-semibold">دریافت محصولات با خطا مواجه شد.</p>
            <Button variant="outline" className="mt-4" onClick={() => void refetch()}>تلاش دوباره</Button>
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
