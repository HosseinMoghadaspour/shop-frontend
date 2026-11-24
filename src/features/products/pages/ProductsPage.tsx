import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ProductGrid } from "../components/ProductGrid";
import { ProductPagination } from "../components/ProductPagination";
import { ProductSearch } from "../components/ProductSearch";
import { ProductGridSkeleton } from "../components/ProductGridSkeleton";
import { useProducts } from "../hooks/useProducts";

const PAGE_SIZE = 20;

export function ProductsPage() {
  const [searchParams] = useSearchParams();
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

  const { data, isLoading, isFetching, isError } = useProducts({
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

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="mx-auto w-full max-w-[1440px] px-3 py-7 sm:px-5 sm:py-10 lg:px-8">
      <div className="mb-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(20,32,68,0.04)] sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              {categoryId ? "محصولات دسته‌بندی" : "همه محصولات"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {categoryId
                ? "کالاهای مرتبط با دسته‌بندی انتخاب‌شده"
                : "هر آنچه برای یک خرید خوب نیاز داری، همین‌جاست."}
            </p>
          </div>

          <ProductSearch
            value={search}
            onChange={handleSearch}
            onClear={handleClearSearch}
          />
        </div>
      </div>

      {isFetching && !isLoading && (
        <p className="mb-3 text-xs text-muted-foreground" role="status">
          در حال به‌روزرسانی نتایج...
        </p>
      )}

      {isLoading ? (
        <ProductGridSkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-white p-8 text-center">
          <p className="font-medium">دریافت محصولات با خطا مواجه شد.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            لطفاً دوباره تلاش کنید.
          </p>
        </div>
      ) : !data || data.products.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <p className="font-medium">محصولی پیدا نشد.</p>
          {search && (
            <p className="mt-2 text-sm text-muted-foreground">
              برای «{search}» محصولی پیدا نشد.
            </p>
          )}
        </div>
      ) : (
        <>
          <ProductGrid products={data.products} />
          <ProductPagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}
