import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ProductGrid } from "../components/ProductGrid";
import { ProductGridSkeleton } from "../components/ProductGridSkeleton";
import { AmazingCountdown } from "@/features/products/components/AmazingCountdown";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/services/products.api";

export function ProductSection({
  eyebrow,
  title,
  description = null,
  products,
  isLoading,
  isError,
  onRetry,
  theme = "plain",
  icon: SectionIcon,
}: {
  eyebrow: string;
  title: string;
  description: string | null;
  products: Product[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  theme?: "plain" | "amazing" | "new" | "best" | "sug";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const sectionTheme = {
    plain: {
      wrapper:
        "bg-white/50 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-6 shadow-sm",
      eyebrow: "text-primary bg-primary/10 px-3 py-1 rounded-full",
      description: "text-muted-foreground",
      link: "text-primary bg-primary/10 hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl",
      iconColor: "text-primary bg-primary/10",
    },
    amazing: {
      wrapper:
        "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-500/10 via-red-500/5 to-amber-500/10 border border-rose-200/60 p-5 sm:p-8 shadow-xl shadow-rose-950/5 backdrop-blur-md",
      eyebrow:
        "text-rose-700 bg-rose-100/80 px-3 py-1 rounded-full shadow-inner",
      description: "text-rose-950/70",
      link: "text-rose-700 bg-rose-200/80 sm:bg-rose-100/60 hover:bg-rose-200/80 px-3.5 py-1.5 rounded-xl shadow-sm",
      iconColor: "text-rose-600 bg-rose-100",
    },
    new: {
      wrapper:
        "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-cyan-500/10 border border-sky-200/60 p-5 sm:p-8 shadow-xl shadow-sky-950/5 backdrop-blur-md",
      eyebrow: "text-sky-800 bg-sky-100/80 px-3 py-1 rounded-full shadow-inner",
      description: "text-slate-700",
      link: "text-sky-800 bg-sky-200/80 sm:bg-sky-100/60 hover:bg-sky-200/80 px-3.5 py-1.5 rounded-xl shadow-sm",
      iconColor: "text-sky-600 bg-sky-100",
    },
    best: {
      wrapper:
        "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border border-violet-200/60 p-5 sm:p-8 shadow-xl shadow-violet-950/5 backdrop-blur-md",
      eyebrow:
        "text-violet-800 bg-violet-100/80 px-3 py-1 rounded-full shadow-inner",
      description: "text-slate-700",
      link: "text-violet-800 bg-violet-200/80 sm:bg-violet-100/60 hover:bg-violet-200/80 px-3.5 py-1.5 rounded-xl shadow-sm",
      iconColor: "text-violet-600 bg-violet-100",
    },
    sug: {
      wrapper:
        "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-cyan-500/10 border border-blue-200/60 p-5 sm:p-8 shadow-xl shadow-blue-950/5 backdrop-blur-md",
      eyebrow:
        "text-blue-800 bg-blue-100/80 px-3 py-1 rounded-full shadow-inner",
      description: "text-slate-700",
      link: "text-blue-800 bg-blue-200/80 sm:bg-blue-100/60 hover:bg-blue-200/80 px-3.5 py-1.5 rounded-xl shadow-sm",
      iconColor: "text-blue-600 bg-blue-100",
    },
  }[theme];

  return (
    <section className={sectionTheme.wrapper}>
      <div
        className={`mb-6 ${theme === "amazing" && "-mt-3"} flex flex-col sm:flex-row sm:items-end justify-between gap-4`}
      >
        <div className="min-w-0 flex items-start gap-3.5">
          {SectionIcon && (
            <span
              className={`flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${sectionTheme.iconColor}`}
            >
              <SectionIcon className="size-6" />
            </span>
          )}
          <div>
            <div className="inline-block mb-1.5">
              <span
                className={`text-xs font-extrabold tracking-wide ${sectionTheme.eyebrow}`}
              >
                {eyebrow}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight sm:text-xl text-slate-900">
              {title}
            </h2>
          </div>
        </div>
        <div>{theme === "amazing" && <AmazingCountdown />}</div>
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
          <Button
            variant="outline"
            className="mt-4 rounded-xl shadow-sm"
            onClick={onRetry}
          >
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
