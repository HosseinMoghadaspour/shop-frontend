import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Package } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/formatter";
import { getApiAssetUrl } from "@/lib/api-url";
import { getSimilarProducts } from "@/services/products.api";

interface SimilarProductsProps {
  productId: number;
}

export function SimilarProducts({ productId }: SimilarProductsProps) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["similar-products", productId],
    queryFn: () => getSimilarProducts(productId, 10),
    enabled: Number.isSafeInteger(productId) && productId > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && products.length === 0) return null;

  return (
    <section dir="rtl" className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 sm:text-xl">کالاهای مشابه</h2>
          <p className="mt-1 text-xs text-muted-foreground">محصولات مرتبط با کالایی که مشاهده می‌کنید</p>
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          مشاهده افقی
          <ChevronLeft className="size-4" />
        </span>
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="w-40 shrink-0 snap-start overflow-hidden p-3 sm:w-48">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </Card>
            ))
          : products.map((product) => {
              const image = product.images.find((item) => item.isDefault) ?? product.images[0];
              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="w-40 shrink-0 snap-start rounded-2xl border bg-white p-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:w-48"
                >
                  <div className="aspect-square overflow-hidden rounded-xl bg-slate-50">
                    {image?.url ? (
                      <img
                        src={getApiAssetUrl(image.url)}
                        alt={image.alt || product.name}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Package className="size-8" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-800">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm font-extrabold text-primary">
                    {formatPrice(product.pricing.finalPrice)}
                  </p>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
