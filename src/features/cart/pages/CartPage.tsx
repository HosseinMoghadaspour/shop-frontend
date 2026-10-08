import { useEffect } from "react";
import { useQueries } from "@tanstack/react-query";

import { AlertCircle, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CartItem } from "../components/CartItem";
import { CartSummary } from "../components/CartSummary";
import { EmptyCart } from "../components/EmptyCart";

import { useCartStore } from "@/stores/cart.store";
import { getProduct } from "@/services/products.api";
import {
  getMinimumQuantity,
  getQuantityStep,
} from "@/features/cart/utils/quantity";

export function CartPage() {
  const cart = useCartStore((state) => state.cart);

  const isLoading = useCartStore((state) => state.isLoading);

  const isUpdating = useCartStore((state) => state.isUpdating);

  const error = useCartStore((state) => state.error);

  const fetchCart = useCartStore((state) => state.fetchCart);

  const updateItem = useCartStore((state) => state.updateItem);

  const removeItem = useCartStore((state) => state.removeItem);

  const clearCart = useCartStore((state) => state.clear);

  const productQueries = useQueries({
    queries: (cart?.items ?? []).map((item) => ({
      queryKey: ["product", item.goodId],
      queryFn: () => getProduct(item.goodId),
      staleTime: 30_000,
      enabled: Boolean(cart),
    })),
  });

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  // ----------------------------------------
  // Loading
  // ----------------------------------------

  if (isLoading && !cart) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />

          <span>در حال دریافت سبد خرید...</span>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // Error
  // ----------------------------------------

  if (error && !cart) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="mb-4 size-10 text-destructive" />

          <p className="font-medium">دریافت سبد خرید با خطا مواجه شد.</p>

          <p className="mt-2 text-sm text-muted-foreground">{error}</p>

          <Button className="mt-5" onClick={() => void fetchCart()}>
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // Empty cart
  // ----------------------------------------

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <h1 className="mb-6 text-2xl font-extrabold sm:text-3xl">سبد خرید</h1>

        <EmptyCart />
      </div>
    );
  }

  // ----------------------------------------
  // Increase quantity
  // ----------------------------------------

  const handleIncrease = async (
    goodId: number,
    quantity: number,
    weightOrAmount: number | null,
    minOrder: number | null,
    maxOrder: number | null,
    availableStock: number,
  ) => {
    const minimum = getMinimumQuantity(weightOrAmount, minOrder);
    const step = getQuantityStep(weightOrAmount);
    const nextQuantity = Number(
      (quantity < minimum ? minimum : quantity + step).toFixed(3),
    );

    if (
      (maxOrder !== null && nextQuantity > maxOrder) ||
      nextQuantity > availableStock
    ) {
      return;
    }

    try {
      await updateItem(goodId, nextQuantity);
    } catch {
      // Error is already stored in Zustand.
    }
  };

  const handleDecrease = async (
    goodId: number,
    quantity: number,
    weightOrAmount: number | null,
    minOrder: number | null,
  ) => {
    const step = getQuantityStep(weightOrAmount);
    const minimum = getMinimumQuantity(weightOrAmount, minOrder);

    const nextQuantity = Number((quantity - step).toFixed(3));

    if (nextQuantity < minimum) {
      return;
    }

    try {
      await updateItem(goodId, nextQuantity);
    } catch {
      // Error is already stored in Zustand.
    }
  };

  const handleQuantityChange = async (
    goodId: number,
    quantity: number,
    weightOrAmount: number | null,
    minOrder: number | null,
    maxOrder: number | null,
    availableStock: number,
  ) => {
    const minimum = getMinimumQuantity(weightOrAmount, minOrder);

    if (
      quantity < minimum ||
      (maxOrder !== null && quantity > maxOrder) ||
      quantity > availableStock ||
      (weightOrAmount === 2 && !Number.isInteger(quantity))
    ) {
      return;
    }

    try {
      await updateItem(goodId, quantity);
    } catch {
      // Error is already stored in Zustand.
    }
  };

  // ----------------------------------------
  // Remove item
  // ----------------------------------------

  const handleRemove = async (goodId: number) => {
    try {
      await removeItem(goodId);
    } catch {
      // Error is already stored in Zustand.
    }
  };

  // ----------------------------------------
  // Clear cart
  // ----------------------------------------

  const handleClear = async () => {
    try {
      await clearCart();
    } catch {
      // Error is already stored in Zustand.
    }
  };

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {/* Header */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">سبد خرید</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {cart.itemsCount.toLocaleString("fa-IR", {
              maximumFractionDigits: 3,
            })}{" "}
            کالا در سبد خرید شما
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={isUpdating}
          onClick={() => void handleClear()}
        >
          <Trash2 className="ml-2 size-4" />
          خالی کردن سبد
        </Button>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {/* Content */}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Items */}

        <div className="space-y-4">
          {cart.items.map((item, index) => {
            const productQuery = productQueries[index];
            const availableStock = productQuery?.data
              ? productQuery.data.stockInfo[0]?.quantity ??
                productQuery.data.stock
              : null;

            return (
            <CartItem
              key={item.goodId}
              item={item}
              availableStock={availableStock}
              isStockLoading={productQuery?.isLoading ?? true}
              stockError={productQuery?.isError ?? false}
              isUpdating={isUpdating}
              onIncrease={() =>
                void handleIncrease(
                  item.goodId,
                  item.quantity,
                  item.unit?.weightOrAmount ?? null,
                  item.minOrder,
                  item.maxOrder,
                  availableStock ?? 0,
                )
              }
              onDecrease={() =>
                void handleDecrease(
                  item.goodId,
                  item.quantity,
                  item.unit?.weightOrAmount ?? null,
                  item.minOrder,
                )
              }
              onQuantityChange={(quantity) =>
                void handleQuantityChange(
                  item.goodId,
                  quantity,
                  item.unit?.weightOrAmount ?? null,
                  item.minOrder,
                  item.maxOrder,
                  availableStock ?? 0,
                )
              }
              onRemove={() => void handleRemove(item.goodId)}
            />
            );
          })}
        </div>

        {/* Summary */}

        <CartSummary cart={cart} isUpdating={isUpdating} />
      </div>
    </div>
  );
}
