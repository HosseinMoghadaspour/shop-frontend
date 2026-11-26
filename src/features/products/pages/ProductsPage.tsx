import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SearchX,
  AlertCircle,
  Sparkles,
  X,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

import { ProductGrid } from "../components/ProductGrid";
import { ProductPagination } from "../components/ProductPagination";
import { ProductSearch } from "../components/ProductSearch";
import { ProductGridSkeleton } from "../components/ProductGridSkeleton";
import { useProducts } from "../hooks/useProducts";

const PAGE_SIZE = 20;

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("categoryId");
  const categoryId =
    categoryParam && /^\d+$/.test(categoryParam)
      ? Number(categoryParam)
      : undefined;
  const searchParam = searchParams.get("search") ?? "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParam);
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam);

  useEffect(() => {
    setSearch(searchParam);
    setPage(1);
  }, [searchParam, categoryId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    );
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const { data, isLoading, isFetching, isError, refetch } = useProducts({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    categoryId,
  });

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleClearSearch() {
    setSearch("");
    setPage(1);
  }

  function handleClearCategory() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("categoryId");
    setSearchParams(nextParams);
    setPage(1);
  }

  function handleResetAll() {
    setSearch("");
    setSearchParams({});
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const totalItems = data?.pagination; // در صورت وجود در پاسخ API

  return (
    <section
      dir="rtl"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      {/* Hero Header Section */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-bl from-slate-50 via-white to-indigo-50/40 p-6 shadow-[0_12px_40px_rgba(20,32,68,0.05)] sm:p-10">
        {/* المان تزیینی پس‌زمینه */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-sky-500/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{categoryId ? "فیلتر بر اساس دسته‌بندی" : "ویترین فروشگاه"}</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {categoryId ? "محصولات دسته‌بندی" : "همه محصولات"}
            </h1>

            <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-base">
              {categoryId
                ? "مجموعه‌ای از بهترین کالاهای مرتبط با دسته‌بندی انتخاب‌شده برای شما."
                : "هر آنچه برای یک خرید هوشمندانه و مطمئن نیاز دارید، همین‌جاست."}
            </p>
          </div>

          <div className="w-full lg:w-96">
            <ProductSearch
              value={search}
              onChange={handleSearch}
              onClear={handleClearSearch}
            />
          </div>
        </div>

        {/* Active Filters & Status Bar */}
        {(categoryId || debouncedSearch || totalItems !== undefined) && (
          <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-slate-500">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                فیلترهای فعال:
              </span>

              {!categoryId && !debouncedSearch && (
                <span className="text-slate-400">بدون فیلتر</span>
              )}

              {categoryId && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 shadow-sm">
                  دسته‌بندی #{categoryId}
                  <button
                    type="button"
                    onClick={handleClearCategory}
                    className="rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500"
                    title="حذف فیلتر دسته‌بندی"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {debouncedSearch && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/70 px-3 py-1 font-medium text-indigo-700">
                  جستجو: «{debouncedSearch}»
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="rounded-full p-0.5 text-indigo-400 transition hover:bg-indigo-100 hover:text-indigo-700"
                    title="پاک کردن جستجو"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-500">
              {isFetching && !isLoading && (
                <span
                  className="inline-flex items-center gap-1.5 font-medium text-indigo-600"
                  role="status"
                >
                  <span className="h-2 w-2 animate-ping rounded-full bg-indigo-600" />
                  در حال به‌روزرسانی...
                </span>
              )}

              {typeof totalItems === "number" && !isLoading && (
                <span>
                  نمایش <strong className="text-slate-800">{totalItems}</strong> کالا
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content States */}
      {isLoading ? (
        <ProductGridSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-100 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            دریافت محصولات با خطا مواجه شد
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-slate-500">
            مشکلی در ارتباط با سرور پیش آمده است. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.
          </p>
          <button
            type="button"
            onClick={() => refetch?.()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            تلاش مجدد
          </button>
        </div>
      ) : !data || data.products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <SearchX className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            محصولی مطابق با جستجوی شما پیدا نشد
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-slate-500">
            {search
              ? `نتیجه‌ای برای عبارت «${search}» یافت نشد. املای کلمات را بررسی کنید یا از کلمات عمومی‌تر استفاده کنید.`
              : "در حال حاضر محصولی در این بخش موجود نیست."}
          </p>
          {(search || categoryId) && (
            <button
              type="button"
              onClick={handleResetAll}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              مشاهده همه محصولات
            </button>
          )}
        </div>
      ) : (
        <div
          className={`transition-opacity duration-200 ${
            isFetching ? "pointer-events-none opacity-60" : "opacity-100"
          }`}
        >
          <ProductGrid products={data.products} />

          <div className="mt-10 border-t border-slate-100 pt-6">
            <ProductPagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </section>
  );
}
