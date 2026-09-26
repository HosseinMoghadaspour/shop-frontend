import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { formatPrice } from "@/lib/formatter";
import { useProduct } from "../hooks/useProduct";
import { getApiAssetUrl } from "@/lib/api-url";
import { useCartStore } from "@/stores/cart.store";
import axios from "axios";

export function ProductDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const productId = Number(id);

  const { data: product, isLoading, isError } = useProduct(productId);

  const addItem = useCartStore((state) => state.addItem);

  const isCartUpdating = useCartStore((state) => state.isUpdating);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (isError || !product) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <h1 className="text-xl font-semibold">محصول پیدا نشد</h1>
            <p className="text-sm text-muted-foreground">
              اطلاعات محصول قابل دریافت نیست.
            </p>
            <Button onClick={() => navigate("/products")}>
              بازگشت به محصولات
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const defaultImage =
    product.images.find((image) => image.isDefault) ?? product.images[0];

  const quantity = product.stockInfo[0]?.quantity ?? 0;
  const isAvailable = quantity > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <Link
          to={"/products"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground ransition-colors hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به محصولات
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
          {/* Image */}
          <div className="flex items-center justify-center">
            <div className="relative aspect-square w-full max-w-lg overflow-hidden rounded-xl bg-muted">
              {defaultImage ? (
                <img
                  src={getApiAssetUrl(defaultImage.url)}
                  alt={defaultImage.alt || product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    تصویر محصول موجود نیست
                  </span>
                </div>
              )}

              {product.amazingSale && (
                <Badge className="absolute right-4 top-4">
                  فروش شگفت‌انگیز
                </Badge>
              )}

              {!product.isActive && (
                <Badge variant="destructive" className="absolute left-4 top-4">
                  غیرفعال
                </Badge>
              )}
            </div>
          </div>

          {/* Product information */}
          <div className="flex flex-col">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

              {product.nameEn && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {product.nameEn}
                </p>
              )}

              <p className="mt-3 text-sm text-muted-foreground">
                کد کالا: {product.code}
              </p>
            </div>

            {/* Description */}
            {product.briefDescription && (
              <p className="mt-6 leading-7 text-muted-foreground">
                {product.briefDescription}
              </p>
            )}

            {/* Price */}
            <div className="mt-8 rounded-xl bg-muted/50 p-5">
              {product.pricing.hasDiscount &&
                product.pricing.discountPercent !== null && (
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.pricing.salePrice)}
                    </span>

                    <Badge variant="destructive">
                      {product.pricing.discountPercent.toLocaleString("fa-IR")}٪
                    </Badge>
                  </div>
                )}

              <p className="text-2xl font-bold">
                {formatPrice(product.pricing.finalPrice)}
              </p>
            </div>

            {/* Stock */}
            <div className="mt-5">
              {isAvailable ? (
                <div className="text-sm">
                  <span className="text-muted-foreground">موجودی:</span>{" "}
                  <span className="font-medium">
                    {product.stockInfo[0].quantity.toLocaleString("fa-IR")}
                  </span>
                </div>
              ) : (
                <Badge variant="destructive">ناموجود</Badge>
              )}
            </div>

            {/* Add to cart */}
            <div className="mt-6">
              <Button
                className="w-full"
                size="lg"
                disabled={
                  isCartUpdating ||
                  !product.isActive ||
                  !product.isShowInOnlineShop ||
                  !isAvailable
                }
                onClick={async () => {
                  try {
                    await addItem(
                      product.id,
                      product.minOrder && product.minOrder > 0
                        ? product.minOrder
                        : 1,
                    );
                  } catch (error) {
                    if (
                      axios.isAxiosError(error) &&
                      error.response?.status === 401
                    ) {
                      navigate(
                        `/auth/login?returnTo=${encodeURIComponent(
                          `/products/${product.id}`,
                        )}`,
                      );
                    }
                  }
                }}
              >
                <ShoppingCart className="ml-2 h-5 w-5" />

                {isCartUpdating ? "در حال افزودن..." : "افزودن به سبد خرید"}
              </Button>
            </div>

            {/* Product meta */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6 text-sm">
              {product.weight !== null && (
                <div>
                  <p className="text-muted-foreground">وزن</p>
                  <p className="mt-1 font-medium">{product.weight}</p>
                </div>
              )}

              {product.minOrder !== null && (
                <div>
                  <p className="text-muted-foreground">حداقل سفارش</p>
                  <p className="mt-1 font-medium">
                    {product.minOrder.toLocaleString("fa-IR")}
                  </p>
                </div>
              )}

              {product.maxOrder !== null && product.maxOrder > 0 && (
                <div>
                  <p className="text-muted-foreground">حداکثر سفارش</p>
                  <p className="mt-1 font-medium">
                    {product.maxOrder.toLocaleString("fa-IR")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full description */}
        {(product.fullDescription || product.description) && (
          <div className="border-t p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold">توضیحات محصول</h2>

            <div className="whitespace-pre-line leading-8 text-muted-foreground">
              {product.fullDescription || product.description}
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}

function ProductDetailsSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <Skeleton className="mb-6 h-5 w-32" />

      <Card>
        <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
          <Skeleton className="aspect-square w-full rounded-xl" />

          <div className="space-y-5">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-1/4" />

            <Skeleton className="h-24 w-full rounded-xl" />

            <Skeleton className="h-14 w-full rounded-xl" />

            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </Card>
    </section>
  );
}
