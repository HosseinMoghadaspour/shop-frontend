import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingCart, PackageCheck, Truck, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { setPendingCartAction } from "@/features/cart/utils/pending-cart";
import { formatPrice } from "@/lib/formatter";
import { useProduct } from "../hooks/useProduct";
import { getApiAssetUrl } from "@/lib/api-url";
import { useCartStore } from "@/stores/cart.store";
import { isUnauthorizedError } from "@/services/api/client";
import {
  getInitialQuantity,
  getMinimumQuantity,
} from "@/features/cart/utils/quantity";

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
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-5 sm:py-10">
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center sm:gap-4 sm:py-10">
            <h1 className="text-lg font-bold sm:text-xl">
              محصول پیدا نشد
            </h1>

            <p className="text-xs text-muted-foreground sm:text-sm">
              اطلاعات محصول قابل دریافت نیست.
            </p>

            <Button onClick={() => navigate("/products")} size="sm">
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

  const minimumQuantity = getMinimumQuantity(
    product.unit?.weightOrAmount,
    product.minOrder,
  );

  const initialQuantity = getInitialQuantity(product.minOrder);

  return (
    <section
      dir="rtl"
      className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-7 lg:px-6 lg:py-10"
    >
      {/* Breadcrumb */}
      <div className="mb-3 flex items-center justify-between sm:mb-5">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:gap-2 sm:px-4 sm:text-sm"
        >
          <ArrowRight className="size-3.5 sm:size-4" />
          بازگشت به محصولات
        </Link>
      </div>

      {/* Main product card */}
      <Card className="overflow-hidden rounded-2xl border border-emerald-950/5 shadow-sm sm:rounded-3xl">
        <div className="grid gap-4 p-3 sm:gap-7 sm:p-6 md:grid-cols-2 md:gap-8 md:p-8 lg:gap-10">
          {/* Product image */}
          <div className="min-w-0">
            <div className="relative mx-auto aspect-square w-full max-w-[360px] overflow-hidden rounded-xl bg-[#f3f6f3] p-3 sm:max-w-lg sm:rounded-2xl sm:p-5 md:p-6 lg:rounded-3xl lg:p-8">
              {defaultImage ? (
                <img
                  src={getApiAssetUrl(defaultImage.url)}
                  alt={defaultImage.alt || product.name}
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    تصویر محصول موجود نیست
                  </span>
                </div>
              )}

              {product.amazingSale && (
                <Badge className="absolute right-2 top-2 gap-1 rounded-full px-2 py-1 text-[10px] sm:right-4 sm:top-4 sm:px-3 sm:text-xs">
                  فروش شگفت‌انگیز
                </Badge>
              )}

              {!product.isActive && (
                <Badge
                  variant="destructive"
                  className="absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] sm:left-4 sm:top-4 sm:text-xs"
                >
                  غیرفعال
                </Badge>
              )}
            </div>
          </div>

          {/* Product information */}
          <div className="flex min-w-0 flex-col">
            {/* Name and status */}
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:mb-3 sm:gap-2">
                {isAvailable ? (
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700 hover:bg-emerald-50 sm:text-xs"
                  >
                    <PackageCheck className="ml-1 size-3 sm:size-3.5" />
                    موجود در انبار
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="rounded-full px-2 py-1 text-[10px] sm:text-xs"
                  >
                    ناموجود
                  </Badge>
                )}

                {product.amazingSale && (
                  <Badge className="rounded-full px-2 py-1 text-[10px] sm:text-xs">
                    فروش ویژه
                  </Badge>
                )}
              </div>

              <h1 className="text-lg font-extrabold leading-8 text-slate-800 sm:text-2xl sm:leading-10 md:text-3xl">
                {product.name}
              </h1>

              {product.nameEn && (
                <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                  {product.nameEn}
                </p>
              )}
            </div>

            {/* Brief description */}
            {product.briefDescription && (
              <p className="mt-3 text-xs leading-6 text-muted-foreground sm:mt-5 sm:text-sm sm:leading-7">
                {product.briefDescription}
              </p>
            )}

            {/* Price */}
            <div className="p-3 text-left sm:mt-6 sm:rounded-2xl sm:p-5">
              {product.pricing.hasDiscount &&
                product.pricing.discountPercent !== null && (
                  <div className="mb-1.5 flex flex-wrap items-center gap-2 sm:mb-2">
                    <span className="text-xs text-muted-foreground line-through sm:text-sm">
                      {formatPrice(product.pricing.salePrice)}
                    </span>

                    <Badge
                      variant="destructive"
                      className="rounded-full px-2 py-0.5 text-[10px] sm:text-xs"
                    >
                      {product.pricing.discountPercent.toLocaleString("fa-IR")}٪
                      تخفیف
                    </Badge>
                  </div>
                )}

              <p className=" font-extrabold text-primary text-lg">
                {formatPrice(product.pricing.finalPrice)}
              </p>
            </div>

            {/* Stock */}
            {/* <div className="mt-3 flex items-center justify-between gap-2 sm:mt-5">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span
                  className={`size-2 shrink-0 rounded-full ${
                    isAvailable ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />

                <span className="text-muted-foreground">
                  {isAvailable ? "موجودی:" : "وضعیت موجودی:"}
                </span>

                {isAvailable && (
                  <span className="font-semibold text-slate-700">
                    {quantity.toLocaleString("fa-IR")}
                  </span>
                )}
              </div>

              {product.maxOrder !== null && product.maxOrder > 0 && (
                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  حداکثر سفارش:{" "}
                  {product.maxOrder.toLocaleString("fa-IR")}
                </span>
              )}
            </div> */}

            {/* Add to cart */}
            <div className="mt-4 sm:mt-6">
              <Button
                className="h-11 w-full rounded-xl text-sm font-bold shadow-sm sm:h-12 sm:text-base"
                disabled={
                  isCartUpdating ||
                  !product.isActive ||
                  !product.isShowInOnlineShop ||
                  !isAvailable
                }
                onClick={async () => {
                  try {
                    await addItem(product.id, initialQuantity);
                    navigate("/cart");
                  } catch (error) {
                    if (isUnauthorizedError(error)) {
                      setPendingCartAction({
                        goodId: product.id,
                        quantity: initialQuantity,
                      });

                      navigate(
                        `/auth/login?returnTo=${encodeURIComponent("/cart")}`,
                      );
                    }
                  }
                }}
              >
                <ShoppingCart className="ml-2 size-4 sm:size-5" />

                {isCartUpdating
                  ? "در حال افزودن..."
                  : "افزودن به سبد خرید"}
              </Button>
            </div>

            {/* Benefits */}
            <div className="mt-4 grid grid-cols-3 gap-1.5 border-t pt-3 sm:mt-6 sm:gap-3 sm:pt-5">
              <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:justify-center sm:gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 sm:size-9">
                  <Truck className="size-4 sm:size-5" />
                </span>

                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  ارسال سفارش
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:justify-center sm:gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 sm:size-9">
                  <ShieldCheck className="size-4 sm:size-5" />
                </span>

                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  خرید مطمئن
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:justify-center sm:gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 sm:size-9">
                  <PackageCheck className="size-4 sm:size-5" />
                </span>

                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  کیفیت کالا
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full description */}
        {(product.fullDescription || product.description) && (
          <div className="border-t bg-white p-3 sm:p-6 md:p-8">
            <h2 className="mb-2 text-base font-bold sm:mb-4 sm:text-xl">
              توضیحات محصول
            </h2>

            <div className="whitespace-pre-line text-xs leading-7 text-muted-foreground sm:text-sm sm:leading-8">
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
    <section className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-7 lg:px-6 lg:py-10">
      <Skeleton className="mb-4 h-8 w-32 sm:mb-6 sm:h-9 sm:w-40" />

      <Card className="overflow-hidden rounded-2xl sm:rounded-3xl">
        <div className="grid gap-4 p-3 sm:gap-7 sm:p-6 md:grid-cols-2 md:p-8">
          <Skeleton className="mx-auto aspect-square w-full max-w-[360px] rounded-xl sm:max-w-lg sm:rounded-2xl" />

          <div className="space-y-3 sm:space-y-5">
            <Skeleton className="h-7 w-3/4 sm:h-9" />
            <Skeleton className="h-4 w-1/3 sm:h-5" />
            <Skeleton className="h-16 w-full rounded-xl sm:h-24" />
            <Skeleton className="h-20 w-full rounded-xl sm:h-24" />
            <Skeleton className="h-11 w-full rounded-xl sm:h-12" />
          </div>
        </div>
      </Card>
    </section>
  );
}

