import { useState } from "react";

import { ProductGrid } from "../components/ProductGrid";
import { ProductPagination } from "../components/ProductPagination";
import { ProductSearch } from "../components/ProductSearch";
import { ProductGridSkeleton } from "../components/ProductGridSkeleton";
import { useProducts } from "../hooks/useProducts";

const PAGE_SIZE = 20;

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, isError } = useProducts({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <div className="mb-8 rounded-3xl border border-emerald-950/5 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">محصولات</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            هر آنچه برای یک خرید خوب نیاز داری، همین‌جاست.
          </p>
        </div>

        <ProductSearch
          value={search}
          onChange={handleSearch}
          onClear={handleClearSearch}
        />
      </div>
      </div>

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
