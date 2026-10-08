import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import type { CartItem as CartItemType } from "@/services/cart.api";
import { getApiAssetUrl } from "@/lib/api-url";
import { formatPrice } from "@/lib/formatter";
import {
  getMinimumQuantity,
  getQuantityStep,
} from "@/features/cart/utils/quantity";

interface CartItemProps {
  item: CartItemType;
  availableStock: number | null;
  isStockLoading: boolean;
  stockError: boolean;
  isUpdating: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({
  item,
  availableStock,
  isStockLoading,
  stockError,
  isUpdating,
  onIncrease,
  onDecrease,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const [quantityDraft, setQuantityDraft] = useState(String(item.quantity));
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const imageUrl = item.imageUrl ? getApiAssetUrl(item.imageUrl) : null;

  // ----------------------------------------
  // Quantity rules
  // ----------------------------------------

  const minOrder = item.minOrder;
  const maxOrder = item.maxOrder;
  const quantityStep = getQuantityStep(item.unit?.weightOrAmount);
  const minimumQuantity = getMinimumQuantity(
    item.unit?.weightOrAmount,
    minOrder,
  );
  const maximumQuantity =
    availableStock === null
      ? maxOrder
      : maxOrder === null
        ? availableStock
        : Math.min(availableStock, maxOrder);
  const nextQuantity =
    item.quantity < minimumQuantity
      ? minimumQuantity
      : item.quantity + quantityStep;

  const canIncrease =
    !isStockLoading &&
    !stockError &&
    (maximumQuantity === null || nextQuantity <= maximumQuantity);

  const canDecrease = item.quantity - quantityStep >= minimumQuantity;

  // ----------------------------------------
  // Format quantity
  // ----------------------------------------

  function handleQuantityBlur() {
    const normalized = quantityDraft
      .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
      .replace(/[٫،]/g, ".");
    const nextQuantity = Number(normalized);
    const isValidNumber = normalized.trim() !== "" && Number.isFinite(nextQuantity);
    const isValidUnit =
      item.unit?.weightOrAmount !== 2 || Number.isInteger(nextQuantity);

    if (
      !isValidNumber ||
      !isValidUnit ||
      nextQuantity < minimumQuantity ||
      (maximumQuantity !== null && nextQuantity > maximumQuantity) ||
      stockError ||
      isStockLoading
    ) {
      setQuantityDraft(String(item.quantity));
      setQuantityError(
        !isValidNumber
          ? "یک مقدار معتبر وارد کنید."
          : !isValidUnit
            ? "برای این کالا فقط تعداد صحیح وارد کنید."
            : stockError
              ? "دریافت موجودی کالا با خطا مواجه شد؛ لطفاً صفحه را تازه کنید."
              : isStockLoading
                ? "در حال بررسی موجودی کالا..."
            : nextQuantity < minimumQuantity
              ? `حداقل مقدار سفارش ${minimumQuantity.toLocaleString("fa-IR")} است.`
            : `حداکثر مقدار قابل سفارش ${maximumQuantity?.toLocaleString("fa-IR")} است.`,
      );
      return;
    }

    const roundedQuantity = Number(nextQuantity.toFixed(3));
    setQuantityDraft(String(roundedQuantity));
    setQuantityError(null);

    if (roundedQuantity !== item.quantity) {
      onQuantityChange(roundedQuantity);
    }
  }

  function handleIncreaseClick() {
    if (
      isStockLoading ||
      stockError ||
      (maximumQuantity !== null && nextQuantity > maximumQuantity)
    ) {
      return;
    }
    setQuantityDraft(String(Number(nextQuantity.toFixed(3))));
    setQuantityError(null);
    onIncrease();
  }

  function handleDecreaseClick() {
    setQuantityDraft(String(Number((item.quantity - quantityStep).toFixed(3))));
    setQuantityError(null);
    onDecrease();
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <Card className="border border-emerald-950/5">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}

          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-0 bg-[#f3f6f3] sm:size-28">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.rowName}
                className="size-full object-contain"
              />
            ) : (
              <span className="text-xs text-muted-foreground">بدون تصویر</span>
            )}
          </div>

          {/* Content */}

          <div className="min-w-0 flex-1">
            {/* Header */}

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="line-clamp-2 font-semibold">{item.rowName}</h3>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isUpdating}
                onClick={onRemove}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            {/* Unit price */}

            <div className="mt-3 flex items-center">
              <span className="text-sm text-muted-foreground">قیمت واحد:</span>

              <span className="mr-2 font-medium">
                {formatPrice(item.unitPrice)}
              </span>
            </div>

            {/* Bottom */}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              {/* Quantity */}

              <div className="flex items-center rounded-md border">
                {/* Increase */}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-none border-full border-primary mr-2 hover:bg-primary bg-primary/5 text-primary hover:text-white"
                  disabled={isUpdating || !canIncrease}
                  onClick={handleIncreaseClick}
                >
                  <Plus className="size-4" />
                </Button>

                {/* Quantity + Unit */}

                <div className="flex min-w-30  flex-col items-center justify-center gap-1 px-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    aria-label={`تعداد ${item.rowName}`}
                    aria-invalid={quantityError !== null}
                    disabled={isUpdating || isStockLoading || stockError}
                    value={quantityDraft}
                    onChange={(event) => {
                      setQuantityDraft(event.target.value);
                      setQuantityError(null);
                    }}
                    onBlur={handleQuantityBlur}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.currentTarget.blur();
                      }
                    }}
                    className="h-8 w-20 px-1 text-center text-sm font-medium mt-3"
                  />
                  {item.unit?.name && (
                    <span className="text-[10px] leading-4 text-muted-foreground">
                      {item.unit.name}
                    </span>
                  )}
                </div>

                {/* Decrease */}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-none border-full border-destructive ml-2 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white"
                  disabled={isUpdating || !canDecrease}
                  onClick={handleDecreaseClick}
                >
                  <Minus className="size-4" />
                </Button>
              </div>

              {quantityError && (
                <p className="mt-2 text-xs text-destructive" role="alert">
                  {quantityError}
                </p>
              )}

              {/* Total */}

              <div className="text-left">
                <div className="text-xs text-muted-foreground">مبلغ</div>

                <div className="font-bold">{formatPrice(item.totalPrice)}</div>
              </div>
            </div>

            {(minOrder !== null ||
              maximumQuantity !== null ||
              maxOrder !== null) && (
              <p className="mt-3 text-xs text-muted-foreground">
                {minOrder !== null && (
                  <>
                    حداقل:{" "}
                    {minimumQuantity.toLocaleString("fa-IR", {
                      maximumFractionDigits: 3,
                    })}
                  </>
                )}

                {minOrder !== null && maximumQuantity !== null && (
                  <span className="mx-1">|</span>
                )}

                {maximumQuantity !== null && (
                  <>
                    حداکثر:{" "}
                    {maximumQuantity.toLocaleString("fa-IR", {
                      maximumFractionDigits: 3,
                    })}
                  </>
                )}
              </p>
            )}

            <p className="mt-2 text-xs text-muted-foreground">
              موجودی:{" "}
              {isStockLoading
                ? "در حال بررسی..."
                : stockError
                  ? "نامشخص"
                  : availableStock?.toLocaleString("fa-IR", {
                      maximumFractionDigits: 3,
                    }) ?? "نامشخص"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
