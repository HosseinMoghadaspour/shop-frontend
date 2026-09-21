import { useProducts } from "../hooks/useProducts";

export function ProductsPage() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useProducts();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        در حال دریافت محصولات...
      </div>
    );
  }

  if (isError) {
    console.error("Products API error:", error);

    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        دریافت محصولات با خطا مواجه شد.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        اطلاعات محصولات دریافت نشد.
      </div>
    );
  }

  if (data.products.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        محصولی پیدا نشد.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          محصولات
        </h1>

        <span className="text-sm text-muted-foreground">
          {data.pagination.total.toLocaleString("fa-IR")} محصول
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.products.map((product) => (
          <article
            key={product.id}
            className="rounded-lg border bg-card p-4"
          >
            <h2 className="font-semibold">
              {product.name}
            </h2>

            {product.nameEn && (
              <p className="mt-1 text-xs text-muted-foreground">
                {product.nameEn}
              </p>
            )}

            <p className="mt-3 text-sm text-muted-foreground">
              کد کالا: {product.code}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        صفحه{" "}
        {data.pagination.page.toLocaleString("fa-IR")}{" "}
        از{" "}
        {data.pagination.totalPages.toLocaleString("fa-IR")}
      </div>
    </div>
  );
}
