import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { CartItem as CartItemType } from "@/services/cart.api";
import { getApiAssetUrl } from "@/lib/api-url";
import { formatPrice } from "@/lib/formatter";

interface CartItemProps {
  item: CartItemType;
  isUpdating: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function CartItem({
  item,
  isUpdating,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const imageUrl = item.imageUrl ? getApiAssetUrl(item.imageUrl) : null;

  // ----------------------------------------
  // Quantity rules
  // ----------------------------------------

  const minOrder = item.minOrder;
  const maxOrder = item.maxOrder;

  const canIncrease = maxOrder === null || item.quantity + 0.5 <= maxOrder;

  const canDecrease = item.quantity - 0.5 >= 0.5;

  // ----------------------------------------
  // Format quantity
  // ----------------------------------------

  const formattedQuantity = item.quantity.toLocaleString("fa-IR", {
    maximumFractionDigits: 3,
  });

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}

          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
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

                <p className="mt-1 text-sm text-muted-foreground">
                  کد کالا: {item.rowCode}
                </p>
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
                  className="size-8 rounded-none"
                  disabled={isUpdating || !canIncrease}
                  onClick={onIncrease}
                >
                  <Plus className="size-4" />
                </Button>

                {/* Quantity + Unit */}

                <div className="flex min-w-20 flex-col items-center justify-center px-2">
                  <span className="text-sm font-medium leading-5">
                    {formattedQuantity}
                  </span>

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
                  className="size-8 rounded-none"
                  disabled={isUpdating || !canDecrease}
                  onClick={onDecrease}
                >
                  <Minus className="size-4" />
                </Button>
              </div>

              {/* Total */}

              <div className="text-left">
                <div className="text-xs text-muted-foreground">مبلغ</div>

                <div className="font-bold">{formatPrice(item.totalPrice)}</div>
              </div>
            </div>

            {/* Min / Max */}

            {(minOrder !== null || maxOrder !== null) && (
              <p className="mt-3 text-xs text-muted-foreground">
                {minOrder !== null && (
                  <>
                    حداقل:{" "}
                    {minOrder.toLocaleString("fa-IR", {
                      maximumFractionDigits: 3,
                    })}
                  </>
                )}

                {minOrder !== null && maxOrder !== null && (
                  <span className="mx-1">|</span>
                )}

                {maxOrder !== null && (
                  <>
                    حداکثر:{" "}
                    {maxOrder.toLocaleString("fa-IR", {
                      maximumFractionDigits: 3,
                    })}
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
