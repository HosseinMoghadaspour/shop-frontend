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
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">محصولات</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            مشاهده و انتخاب محصولات فروشگاه
          </p>
        </div>

        <ProductSearch
          value={search}
          onChange={handleSearch}
          onClear={handleClearSearch}
        />
      </div>

      {isLoading ? (
        <ProductGridSkeleton />
      ) : isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="font-medium">
            دریافت محصولات با خطا مواجه شد.
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            لطفاً دوباره تلاش کنید.
          </p>
        </div>
      ) : !data || data.products.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          <p className="font-medium">محصولی پیدا نشد.</p>

          {search && (
            <p className="mt-2 text-sm text-muted-foreground">
              برای «{search}» محصولی پیدا نشد.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {data.pagination.total.toLocaleString("fa-IR")} محصول
            </span>

            {isFetching && (
              <span className="text-xs text-muted-foreground">
                در حال بروزرسانی...
              </span>
            )}
          </div>

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
