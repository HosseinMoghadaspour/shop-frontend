import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoaderCircle, Minus, Plus, ShoppingCart } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatter";
import { getApiAssetUrl } from "@/lib/api-url";
import type { Product } from "@/services/products.api";
import { useCartStore } from "@/stores/cart.store";
import { isUnauthorizedError } from "@/services/api/client";
import { setPendingCartAction } from "@/features/cart/utils/pending-cart";
import {
  getInitialQuantity,
  getMinimumQuantity,
  getQuantityStep,
} from "@/features/cart/utils/quantity";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const cart = useCartStore((state) => state.cart);
  const isCartLoading = useCartStore((state) => state.isLoading);
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isCartUpdating = useCartStore((state) => state.isUpdating);

  const [isBusy, setIsBusy] = useState(false);

  const { name, pricing, isSpecialSale, amazingSale } = product;

  const stockInfo = Array.isArray(product.stockInfo) ? product.stockInfo : [];

  const availableStock = stockInfo[0]?.quantity ?? product.stock ?? 0;

  const isAvailable =
    availableStock > 0 && product.isActive && product.isShowInOnlineShop;

  const defaultImage =
    product.images?.find((image) => image.isDefault) ?? product.images?.[0];

  const cartItem = cart?.items.find((item) => item.goodId === product.id);

  const quantity = cartItem?.quantity ?? 0;

  const step = getQuantityStep(product.unit?.weightOrAmount);

  const minimum = getMinimumQuantity(
    product.unit?.weightOrAmount,
    product.minOrder,
  );

  const initialQuantity = getInitialQuantity(product.minOrder);

  const maximum =
    product.maxOrder && product.maxOrder > 0
      ? Math.min(product.maxOrder, availableStock)
      : availableStock;

  const canAdd = initialQuantity <= maximum;
  const canIncrease = quantity + step <= maximum;

  async function redirectIfUnauthorized(
    error: unknown,
    requestedQuantity: number,
  ) {
    if (isUnauthorizedError(error)) {
      setPendingCartAction({
        goodId: product.id,
        quantity: requestedQuantity,
      });

      navigate(`/auth/login?returnTo=${encodeURIComponent("/")}`);
    }
  }

  async function handleAdd() {
    if (!isAvailable || !canAdd || isBusy || isCartUpdating || isCartLoading) {
      return;
    }

    setIsBusy(true);

    try {
      await addItem(product.id, initialQuantity);
    } catch (error) {
      await redirectIfUnauthorized(error, initialQuantity);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleIncrease() {
    if (isBusy || isCartUpdating || isCartLoading || !canIncrease) {
      return;
    }

    setIsBusy(true);

    try {
      if (cartItem) {
        await updateItem(product.id, Number((quantity + step).toFixed(3)));
      } else {
        await addItem(product.id, initialQuantity);
      }
    } catch (error) {
      await redirectIfUnauthorized(error, initialQuantity);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDecrease() {
    if (!cartItem || isBusy || isCartUpdating || isCartLoading) {
      return;
    }

    setIsBusy(true);

    try {
      const next = Number((quantity - step).toFixed(3));

      if (next < minimum) {
        await removeItem(product.id);
      } else {
        await updateItem(product.id, next);
      }
    } catch {
      // خطا در رابط فعلی سبد خرید مدیریت می‌شود.
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Card
      className="
    group flex h-[330px] w-full max-w-[190px] min-w-0 flex-col
    overflow-hidden rounded-2xl border-0 bg-white
    shadow-[0_3px_18px_rgba(15,23,42,0.06)]
    ring-1 ring-slate-900/[0.035]
    transition-shadow duration-300
    hover:shadow-[0_14px_32px_rgba(15,23,42,0.12)]
    sm:h-[290px]
  "
    >
      {/* تصویر محصول */}
      <Link
        to={`/products/${product.id}`}
        className="
          relative block shrink-0 overflow-hidden
          rounded-t-xl
        "
      >
        <div
          className="
            relative flex h-[112px] w-full
            items-center justify-center overflow-hidden
            bg-gradient-to-br from-slate-50 via-white to-emerald-50/70
            sm:h-[125px]
          "
        >
          {defaultImage ? (
            <img
              src={getApiAssetUrl(defaultImage.url)}
              alt={defaultImage.alt || product.name || "تصویر محصول"}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
              className="
                absolute inset-0 m-auto
                h-[90%] w-[90%]
                object-contain object-center
                transition-transform duration-300
                group-hover:scale-105
              "
            />
          ) : (
            <span className="text-[10px] text-muted-foreground">
              تصویر محصول
            </span>
          )}
        </div>

        {/* برچسب فروش ویژه */}
        {(isSpecialSale || amazingSale) && (
          <Badge
            className="
              absolute right-1.5 top-1.5
              rounded-full border-0
              bg-emerald-600 px-2 py-0.5
              text-[9px] font-bold text-white
              shadow-sm
            "
          >
            {amazingSale ? "شگفت‌انگیز" : "فروش ویژه"}
          </Badge>
        )}

        {/* درصد تخفیف */}
        {pricing.hasDiscount && pricing.discountPercent !== null && (
          <Badge
            variant="destructive"
            className="
                absolute left-1.5 top-1.5
                rounded-full border-0
                bg-rose-500 px-1.5 py-0.5
                text-[9px] font-bold text-white
                shadow-sm
              "
          >
            {pricing.discountPercent.toLocaleString("fa-IR")}٪
          </Badge>
        )}
      </Link>

      {/* اطلاعات محصول */}
      <CardContent
        className="
          flex min-h-0 flex-1 flex-col
          px-2.5 pb-1.5 pt-2
        "
      >
        <Link to={`/products/${product.id}`} className="min-w-0">
          <h2
            className="
              line-clamp-2 min-h-[36px]
              text-[11px] font-bold leading-[18px]
              text-slate-800
              transition-colors
              group-hover:text-emerald-700
              sm:text-xs
            "
          >
            {name}
          </h2>
        </Link>

        {/* قیمت */}
        <div className="mt-auto pt-1.5">
          {pricing.hasDiscount && (
            <p
              className="
                mb-0.5 text-[10px]
                leading-4 text-muted-foreground
                line-through
              "
            >
              {formatPrice(pricing.salePrice)}
            </p>
          )}

          <p
            className="
              text-left text-xs font-extrabold
              leading-5 text-emerald-700
              sm:text-sm
            "
          >
            {formatPrice(pricing.finalPrice)}
          </p>
        </div>

        {/* موجودی */}
        <div className="mt-0.5 min-h-[15px]">
          {isAvailable && availableStock <= 10 && (
            <span className="text-[9px] text-muted-foreground">
              موجودی: {availableStock.toLocaleString("fa-IR")}
            </span>
          )}
        </div>
      </CardContent>

      {/* دکمه خرید و تعداد */}
      <CardFooter className="shrink-0 px-2.5 pb-2.5 pt-0">
        {!isAvailable ? (
          <Button
            type="button"
            variant="secondary"
            disabled
            className="h-8 w-full rounded-lg text-[11px]"
          >
            ناموجود
          </Button>
        ) : quantity > 0 ? (
          <div
            className="
              flex h-8 w-full items-center
              justify-between rounded-lg
              bg-emerald-50 px-0.5
              ring-1 ring-emerald-100
            "
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`افزایش تعداد ${name}`}
              className="
                size-7 shrink-0 rounded-md
                text-emerald-700
                hover:bg-emerald-100
              "
              disabled={
                isBusy || isCartUpdating || isCartLoading || !canIncrease
              }
              onClick={() => void handleIncrease()}
            >
              {isBusy ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
            </Button>

            <span className="min-w-0 text-center text-[11px] font-bold tabular-nums">
              {quantity.toLocaleString("fa-IR")}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`کاهش تعداد ${name}`}
              className="
                size-7 shrink-0 rounded-md
                text-emerald-700
                hover:bg-emerald-100,
                mt-2
              "
              disabled={isBusy || isCartUpdating || isCartLoading}
              onClick={() => void handleDecrease()}
            >
              <Minus className="size-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            className="
              h-8 w-full rounded-lg
              bg-emerald-700 px-1.5
              text-[10px] font-bold text-white
              shadow-sm transition
              hover:bg-emerald-800
              sm:text-[11px],
              mt-2
            "
            disabled={isBusy || isCartUpdating || isCartLoading || !canAdd}
            onClick={() => void handleAdd()}
          >
            {isBusy ? (
              <LoaderCircle className="ml-1 size-3.5 shrink-0 animate-spin" />
            ) : (
              <ShoppingCart className="ml-1 size-3.5 shrink-0" />
            )}

            <span className="truncate">افزودن به سبد</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
