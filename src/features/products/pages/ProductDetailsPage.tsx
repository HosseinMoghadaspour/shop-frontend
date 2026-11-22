import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShoppingCart,
  Minus,
  Plus,
  LoaderCircle,
  PackageCheck,
  Truck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { setPendingCartAction } from "@/features/cart/utils/pending-cart";
import { formatPrice } from "@/lib/formatter";
import { getApiAssetUrl } from "@/lib/api-url";
import { useCartStore } from "@/stores/cart.store";
import { useSelectedBranchId } from "@/hooks/useSelectedBranchId";
import { isUnauthorizedError } from "@/services/api/client";

import {
  getInitialQuantity,
  getMinimumQuantity,
  getQuantityStep,
  formatQuantityWithUnit,
} from "@/features/cart/utils/quantity";

import { useProduct } from "../hooks/useProduct";

export function ProductDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const productId = Number(id);

  const { data: product, isLoading, isError } = useProduct(productId);

  console.log(product);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const branchId = useSelectedBranchId();
  const cart = useCartStore((state) => state.cart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isCartLoading = useCartStore((state) => state.isLoading);
  const isCartUpdating = useCartStore((state) => state.isUpdating);

  // Keep the shared cart store hydrated when a product detail page is opened directly.
  useEffect(() => {
    void fetchCart();
  }, [fetchCart, branchId]);

  // Set default product image
  useEffect(() => {
    if (!product) return;

    const defaultIndex = product.images.findIndex((image) => image.isDefault);

    setActiveImageIndex(defaultIndex >= 0 ? defaultIndex : 0);
  }, [product?.id, product?.images]);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (isError || !product) {
    return (
      <section className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 sm:py-10">
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <h1 className="text-lg font-bold sm:text-xl">محصول پیدا نشد</h1>

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

  const currentProduct = product;

  const images = currentProduct.images;
  const availableStock = currentProduct.stockInfo[0]?.quantity ?? 0;
  const cartItem = cart?.items.find(
    (item) => Number(item.goodId) === Number(currentProduct.id),
  );
  const cartQuantity = cartItem?.quantity ?? 0;

  async function handleAddToCart() {
    if (!canPurchase || isCartUpdating || isCartLoading || cartQuantity > 0)
      return;

    try {
      await addItem(currentProduct.id, initialQuantity);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setPendingCartAction({
          goodId: currentProduct.id,
          quantity: initialQuantity,
        });

        navigate(
          `/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`,
        );
      }
    }
  }

  async function handleIncreaseCartQuantity() {
    const step = getQuantityStep(currentProduct.unit?.weightOrAmount);
    const maximum =
      currentProduct.maxOrder && currentProduct.maxOrder > 0
        ? Math.min(currentProduct.maxOrder, availableStock)
        : availableStock;
    const nextQuantity = Number((cartQuantity + step).toFixed(3));

    if (!cartItem || isCartUpdating || isCartLoading || nextQuantity > maximum)
      return;

    try {
      await updateItem(currentProduct.id, nextQuantity);
    } catch {
      // The shared cart store keeps the error state.
    }
  }

  async function handleDecreaseCartQuantity() {
    if (!cartItem || isCartUpdating || isCartLoading) return;

    const step = getQuantityStep(currentProduct.unit?.weightOrAmount);
    const nextQuantity = Number((cartQuantity - step).toFixed(3));

    try {
      if (nextQuantity < minimumQuantity) {
        await removeItem(currentProduct.id);
      } else {
        await updateItem(currentProduct.id, nextQuantity);
      }
    } catch {
      // The shared cart store keeps the error state.
    }
  }

  const activeImage = images[activeImageIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;
  const isAvailable = availableStock > 0;

  const canPurchase =
    product.isActive && product.isShowInOnlineShop && isAvailable;

  const minimumQuantity = getMinimumQuantity(
    product.unit?.weightOrAmount,
    product.minOrder,
  );

  const initialQuantity = getInitialQuantity(product.minOrder);

  // Image navigation
  function showPreviousImage() {
    setActiveImageIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }

  function showNextImage() {
    setActiveImageIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  }

  return (
    <section
      dir="rtl"
      className="mx-auto w-full max-w-7xl px-3 pb-28 pt-4 sm:px-5 sm:py-7 lg:px-6 lg:py-10"
    >
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center justify-between sm:mb-5">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:px-4 sm:text-sm"
        >
          <ArrowRight className="size-4" />
          بازگشت به محصولات
        </Link>
      </div>

      {/* Main Product Card */}
      <Card className="overflow-hidden rounded-2xl border border-emerald-950/5 shadow-sm sm:rounded-3xl">
        <div className="grid gap-5 p-3 sm:gap-7 sm:p-6 md:grid-cols-2 md:gap-8 md:p-8 lg:gap-10">
          {/* Product Gallery */}
          <div className="min-w-0">
            <div
              dir="ltr"
              className="mx-auto flex w-full max-w-[350px] flex-row items-stretch gap-2 md:block"
            >
              {/* Main Image */}
              <div className="group relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:rounded-3xl">
                <div className="relative aspect-square overflow-hidden bg-[#f5f7f5]">
                  {activeImage ? (
                    <div
                      className="flex h-full w-full transition-transform duration-500 ease-in-out"
                      style={{
                        direction: "ltr",
                        transform: `translateX(-${activeImageIndex * 100}%)`,
                      }}
                    >
                      {images.map((image) => (
                        <div
                          key={image.url}
                          className="flex h-full min-w-full shrink-0 items-center justify-center p-3 sm:p-5 md:p-4"
                        >
                          <img
                            src={getApiAssetUrl(image.url)}
                            alt={image.alt || product.name}
                            className="h-full w-full select-none object-contain object-center mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                            draggable={false}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        تصویر محصول موجود نیست
                      </span>
                    </div>
                  )}

                  {/* Amazing Sale Badge */}
                  {product.amazingSale && (
                    <Badge className="absolute right-2 top-2 z-10 rounded-full px-2.5 py-1 text-[10px] shadow-sm sm:right-4 sm:top-4 sm:text-xs">
                      فروش شگفت‌انگیز
                    </Badge>
                  )}

                  {/* Inactive Badge */}
                  {!product.isActive && (
                    <Badge
                      variant="destructive"
                      className="absolute left-2 top-2 z-10 rounded-full px-2.5 py-1 text-[10px] shadow-sm sm:left-4 sm:top-4 sm:text-xs"
                    >
                      غیرفعال
                    </Badge>
                  )}

                  {/* Image Navigation */}
                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousImage}
                        aria-label="تصویر قبلی"
                        className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:scale-110 sm:right-3 sm:size-8"
                      >
                        <ChevronRight className="size-5" />
                      </button>

                      <button
                        type="button"
                        onClick={showNextImage}
                        aria-label="تصویر بعدی"
                        className="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:scale-110 sm:left-3 sm:size-8"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {hasMultipleImages && (
                <div className="flex w-[62px] shrink-0 flex-col gap-2 overflow-y-auto overflow-x-hidden py-1 sm:w-[76px] md:mt-4 md:w-full md:flex-row md:overflow-x-auto md:overflow-y-hidden md:pb-2">
                  {images.map((image, index) => {
                    const isSelected = activeImageIndex === index;

                    return (
                      <button
                        key={image.url}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        aria-label={`نمایش تصویر ${index + 1}`}
                        aria-pressed={isSelected}
                        className={`relative size-[58px] shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition-all duration-200 sm:size-[72px] md:size-20 md:rounded-2xl ${
                          isSelected
                            ? "border-primary shadow-md shadow-primary/15"
                            : "border-slate-100 opacity-70 hover:border-slate-300 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={getApiAssetUrl(image.url)}
                          alt={
                            image.alt || `${product.name} - تصویر ${index + 1}`
                          }
                          className="h-full w-full rounded-lg object-contain"
                          loading="lazy"
                        />

                        {isSelected && (
                          <span className="absolute inset-x-1 bottom-1 h-1 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="flex min-w-0 flex-col">
            {/* Product Status */}
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-3">
                {isAvailable ? (
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700 hover:bg-emerald-50 sm:text-xs"
                  >
                    <PackageCheck className="ml-1 size-3.5" />
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

              {/* Product Name */}
              <h1 className="text-lg font-extrabold leading-8 text-slate-800 sm:text-2xl sm:leading-10">
                {product.name}
              </h1>
            </div>

            {/* Brief Description */}
            {product.briefDescription && (
              <p className="mt-3 text-xs leading-7 text-muted-foreground sm:mt-5 sm:text-sm sm:leading-8">
                {product.briefDescription}
              </p>
            )}

            {/* Product Price */}
            <div className="text-left p-3">
              <div className="flex gap-3">
                <div className="w-full">
                  {product.pricing.hasDiscount &&
                    product.pricing.discountPercent !== null && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground line-through sm:text-sm">
                          {formatPrice(product.pricing.salePrice)}
                        </span>

                        <Badge
                          variant="destructive"
                          className="rounded-full px-2 py-0.5 text-[10px] sm:text-xs"
                        >
                          {product.pricing.discountPercent.toLocaleString(
                            "fa-IR",
                          )}
                          ٪ تخفیف
                        </Badge>
                      </div>
                    )}

                  <p className="text-lg font-extrabold text-primary sm:text-xl">
                    {formatPrice(product.pricing.finalPrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="text-xs  sm:text-sm">
              <div className="flex items-center gap-2 -mt-8">
                <span
                  className={`size-2 rounded-full ${
                    isAvailable ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />

                <span className="text-muted-foreground">
                  {isAvailable ? "موجودی کالا:" : "وضعیت موجودی:"}
                </span>

                {isAvailable && (
                  <span className="font-semibold text-slate-700">
                    {product.stock.toLocaleString("fa-IR")}
                  </span>
                )}
              </div>

              {product.maxOrder !== null && product.maxOrder > 0 && (
                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  حداکثر سفارش: {product.maxOrder.toLocaleString("fa-IR")}
                </span>
              )}
            </div>

            {/* Minimum Order */}
            {minimumQuantity > 1 && (
              <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">
                حداقل مقدار سفارش: {minimumQuantity.toLocaleString("fa-IR")}
              </p>
            )}

            {/* Desktop Cart Controls */}
            <div className="mt-5 hidden sm:block md:mt-6">
              {cartQuantity > 0 ? (
                <div className="flex h-12 w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="افزایش تعداد"
                    disabled={
                      isCartUpdating ||
                      isCartLoading ||
                      cartQuantity +
                        getQuantityStep(product.unit?.weightOrAmount) >
                        (product.maxOrder && product.maxOrder > 0
                          ? Math.min(product.maxOrder, availableStock)
                          : availableStock)
                    }
                    onClick={() => void handleIncreaseCartQuantity()}
                  >
                    {isCartUpdating ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-5" />
                    )}
                  </Button>
                  <span className="text-sm font-bold text-emerald-800">
                    {formatQuantityWithUnit(
                      cartQuantity,
                      product.stockInfo[0].smallestUnit,
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="کاهش تعداد"
                    disabled={isCartUpdating || isCartLoading}
                    onClick={() => void handleDecreaseCartQuantity()}
                  >
                    <Minus className="size-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  className="h-12 w-full rounded-xl text-sm font-bold shadow-sm transition-all hover:shadow-md sm:text-base"
                  disabled={!canPurchase || isCartUpdating || isCartLoading}
                  onClick={handleAddToCart}
                >
                  {isCartUpdating || isCartLoading ? (
                    <LoaderCircle className="ml-2 size-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="ml-2 size-5" />
                  )}
                  {isCartUpdating
                    ? "در حال افزودن..."
                    : isCartLoading
                      ? "در حال بررسی سبد..."
                      : !isAvailable
                        ? "ناموجود"
                        : !product.isActive || !product.isShowInOnlineShop
                          ? "غیرفعال"
                          : "افزودن به سبد خرید"}
                </Button>
              )}
            </div>

            {/* Benefits */}
            <div className="mt-5 grid grid-cols-3 gap-2 border-t pt-4 sm:mt-6 sm:gap-3 sm:pt-5">
              <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center">
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Truck className="size-5" />
                </span>

                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  ارسال سفارش
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center">
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="size-5" />
                </span>

                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  خرید مطمئن
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center">
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <PackageCheck className="size-5" />
                </span>

                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  کیفیت کالا
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        {(product.fullDescription || product.description) && (
          <div className="border-t bg-white p-3 sm:p-6 md:p-8">
            <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-xl">
              توضیحات محصول
            </h2>

            <div className="whitespace-pre-line text-xs leading-7 text-muted-foreground sm:text-sm sm:leading-8">
              {product.fullDescription || product.description}
            </div>
          </div>
        )}
      </Card>

      {/* Mobile Sticky Purchase Bar */}
      <div
        dir="rtl"
        className="fixed inset-x-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:hidden"
        style={{
          bottom: "calc(4.25rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          {/* Price */}
          <div className="min-w-0 flex-1">
            {product.pricing.hasDiscount && (
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatPrice(product.pricing.salePrice)}
                </span>

                {product.pricing.discountPercent !== null && (
                  <Badge
                    variant="destructive"
                    className="rounded-full px-1.5 py-0 text-[9px]"
                  >
                    {product.pricing.discountPercent.toLocaleString("fa-IR")}٪
                  </Badge>
                )}
              </div>
            )}

            <p className="truncate text-base font-extrabold text-primary">
              {formatPrice(product.pricing.finalPrice)}
            </p>

            <span className="text-[9px] text-muted-foreground">قیمت نهایی</span>
          </div>

          {/* Mobile Cart Controls */}
          {cartQuantity > 0 ? (
            <div className="flex h-11 max-w-[190px] flex-1 items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="افزایش تعداد"
                disabled={
                  isCartUpdating ||
                  isCartLoading ||
                  cartQuantity + getQuantityStep(product.unit?.weightOrAmount) >
                    (product.maxOrder && product.maxOrder > 0
                      ? Math.min(product.maxOrder, availableStock)
                      : availableStock)
                }
                onClick={() => void handleIncreaseCartQuantity()}
              >
                {isCartUpdating ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
              </Button>
              <span className="text-xs font-bold text-emerald-800">
                {formatQuantityWithUnit(cartQuantity, product.unit?.name)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="کاهش تعداد"
                disabled={isCartUpdating || isCartLoading}
                onClick={() => void handleDecreaseCartQuantity()}
              >
                <Minus className="size-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={!canPurchase || isCartUpdating || isCartLoading}
              className="h-11 max-w-[190px] flex-1 rounded-xl text-xs font-bold shadow-sm"
            >
              {isCartUpdating || isCartLoading ? (
                <LoaderCircle className="ml-2 size-4 animate-spin" />
              ) : (
                <ShoppingCart className="ml-2 size-4" />
              )}
              {isCartUpdating
                ? "در حال افزودن..."
                : isCartLoading
                  ? "در حال بررسی..."
                  : !isAvailable
                    ? "ناموجود"
                    : !product.isActive || !product.isShowInOnlineShop
                      ? "غیرفعال"
                      : "افزودن به سبد خرید"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

// Product Details Skeleton
function ProductDetailsSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-3 pb-24 pt-4 sm:px-5 sm:py-7 lg:px-6 lg:py-10">
      <Skeleton className="mb-4 h-8 w-32 sm:mb-6 sm:h-9 sm:w-40" />

      <Card className="overflow-hidden rounded-2xl sm:rounded-3xl">
        <div className="grid gap-4 p-3 sm:gap-7 sm:p-6 md:grid-cols-2 md:p-8">
          <div className="flex gap-2 md:block">
            <Skeleton className="aspect-square min-w-0 flex-1 rounded-xl sm:rounded-2xl" />

            <div className="flex w-[58px] shrink-0 flex-col gap-2 md:hidden">
              <Skeleton className="size-[58px] rounded-xl" />
              <Skeleton className="size-[58px] rounded-xl" />
              <Skeleton className="size-[58px] rounded-xl" />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
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
