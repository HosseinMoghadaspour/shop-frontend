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
import { getInitialQuantity, getMinimumQuantity, getQuantityStep } from "@/features/cart/utils/quantity";

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
  const isAvailable = availableStock > 0 && product.isActive && product.isShowInOnlineShop;
  const defaultImage = product.images?.find((image) => image.isDefault) ?? product.images?.[0];
  const cartItem = cart?.items.find((item) => item.goodId === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const step = getQuantityStep(product.unit?.weightOrAmount);
  const minimum = getMinimumQuantity(product.unit?.weightOrAmount, product.minOrder);
  const initialQuantity = getInitialQuantity(product.minOrder);
  const maximum = product.maxOrder && product.maxOrder > 0
    ? Math.min(product.maxOrder, availableStock)
    : availableStock;
  const canIncrease = quantity + step <= maximum;

  async function redirectIfUnauthorized(error: unknown, requestedQuantity: number) {
    if (isUnauthorizedError(error)) {
      setPendingCartAction({ goodId: product.id, quantity: requestedQuantity });
      navigate(`/auth/login?returnTo=${encodeURIComponent("/")}`);
    }
  }

  async function handleAdd() {
    if (!isAvailable || isBusy || isCartUpdating || isCartLoading) return;
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
    if (isBusy || isCartUpdating || isCartLoading || !canIncrease) return;
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
    if (!cartItem || isBusy || isCartUpdating || isCartLoading) return;
    setIsBusy(true);
    try {
      const next = Number((quantity - step).toFixed(3));
      if (next < minimum) {
        await removeItem(product.id);
      } else {
        await updateItem(product.id, next);
      }
    } catch {
      // The cart store keeps the error for the existing cart UI.
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Card className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-emerald-950/5 bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/8">
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#f3f6f3] p-3 sm:p-4">
          {defaultImage ? (
            <img
              src={getApiAssetUrl(defaultImage.url)}
              alt={defaultImage.alt || product.name || "تصویر محصول"}
              loading="lazy"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
              className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-xs text-muted-foreground">تصویر محصول</span>
          )}
        </div>
        {(isSpecialSale || amazingSale) && (
          <Badge className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] shadow-sm">
            {amazingSale ? "شگفت‌انگیز" : "فروش ویژه"}
          </Badge>
        )}
        {pricing.hasDiscount && pricing.discountPercent !== null && (
          <Badge variant="destructive" className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px]">
            {pricing.discountPercent.toLocaleString("fa-IR")}٪
          </Badge>
        )}
      </Link>

      <CardContent className="flex flex-1 flex-col p-2.5 sm:p-3">
        <Link to={`/products/${product.id}`} className="min-w-0">
          <h2 className="line-clamp-2 min-h-10 text-xs font-semibold leading-5 transition-colors group-hover:text-primary sm:text-sm">
            {name}
          </h2>
        </Link>

        <div className="mt-auto pt-3">
          {pricing.hasDiscount && (
            <p className="mb-0.5 text-[10px] text-muted-foreground line-through sm:text-xs">
              {formatPrice(pricing.salePrice)}
            </p>
          )}
          <p className="text-sm font-extrabold leading-6 text-primary sm:text-base">
            {formatPrice(pricing.finalPrice)}
            <span className="mr-1 text-[10px] font-normal text-muted-foreground">تومان</span>
          </p>
        </div>

        <div className="mt-1.5 min-h-4">
          {isAvailable ? (
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              موجودی: {availableStock.toLocaleString("fa-IR")}
            </span>
          ) : (
            <span className="text-[10px] font-medium text-destructive">ناموجود</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-2.5 pt-0 sm:p-3 sm:pt-0">
        {!isAvailable ? (
          <Button type="button" variant="secondary" disabled className="h-9 w-full rounded-xl text-xs">
            ناموجود
          </Button>
        ) : quantity > 0 ? (
          <div className="flex h-9 w-full items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-1">
            <Button type="button" variant="ghost" size="icon" aria-label={`افزایش تعداد ${name}`} className="size-7 rounded-lg text-primary hover:bg-primary/10" disabled={isBusy || isCartUpdating || isCartLoading || !canIncrease} onClick={() => void handleIncrease()}>
              {isBusy ? <LoaderCircle className="size-3.5 animate-spin" /> : <Plus className="size-4" />}
            </Button>
            <span className="min-w-8 text-center text-xs font-bold tabular-nums">{quantity.toLocaleString("fa-IR")}</span>
            <Button type="button" variant="ghost" size="icon" aria-label={`کاهش تعداد ${name}`} className="size-7 rounded-lg text-primary hover:bg-primary/10" disabled={isBusy || isCartUpdating || isCartLoading} onClick={() => void handleDecrease()}>
              <Minus className="size-4" />
            </Button>
          </div>
        ) : (
          <Button type="button" className="h-9 w-full rounded-xl text-xs font-semibold" disabled={isBusy || isCartUpdating || isCartLoading} onClick={() => void handleAdd()}>
            {isBusy ? <LoaderCircle className="ml-1 size-4 animate-spin" /> : <ShoppingCart className="ml-1 size-4" />}
            افزودن به سبد
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
