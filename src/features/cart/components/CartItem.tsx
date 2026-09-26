import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

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
  const imageUrl = item.imageUrl
    ? getApiAssetUrl(item.imageUrl)
    : null;

  const canIncrease =
    item.maxOrder === null ||
    item.quantity < item.maxOrder;

  const canDecrease =
    item.minOrder === null ||
    item.quantity > item.minOrder;

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
              <span className="text-xs text-muted-foreground">
                بدون تصویر
              </span>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="line-clamp-2 font-semibold">
                  {item.rowName}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  کد کالا: {item.rowCode}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                disabled={isUpdating}
                onClick={onRemove}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            {/* Price */}
            <div className="mt-3">
              <span className="text-sm text-muted-foreground">
                قیمت واحد:
              </span>

              <span className="mr-2 font-medium">
                {formatPrice(item.unitPrice)}
              </span>
            </div>

            {/* Bottom */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              {/* Quantity */}
              <div className="flex items-center rounded-md border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-none"
                  disabled={
                    isUpdating || !canIncrease
                  }
                  onClick={onIncrease}
                >
                  <Plus className="size-4" />
                </Button>

                <span className="flex min-w-10 items-center justify-center text-sm font-medium">
                  {item.quantity}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-none"
                  disabled={
                    isUpdating || !canDecrease
                  }
                  onClick={onDecrease}
                >
                  <Minus className="size-4" />
                </Button>
              </div>

              {/* Total */}
              <div className="text-left">
                <div className="text-xs text-muted-foreground">
                  مبلغ
                </div>

                <div className="font-bold">
                  {formatPrice(item.totalPrice)}
                </div>
              </div>
            </div>

            {/* Min / Max */}
            {(item.minOrder !== null ||
              item.maxOrder !== null) && (
              <p className="mt-3 text-xs text-muted-foreground">
                {item.minOrder !== null &&
                  `حداقل: ${item.minOrder}`}

                {item.minOrder !== null &&
                  item.maxOrder !== null &&
                  " | "}

                {item.maxOrder !== null &&
                  `حداکثر: ${item.maxOrder}`}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
