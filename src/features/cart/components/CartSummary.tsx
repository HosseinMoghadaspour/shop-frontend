import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Cart } from "@/services/cart.api";
import { formatPrice } from "@/lib/formatter";

interface CartSummaryProps {
  cart: Cart;
  isUpdating: boolean;
}

export function CartSummary({
  cart,
  isUpdating,
}: CartSummaryProps) {
  const navigate = useNavigate();

  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle>خلاصه سفارش</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            تعداد کالا
          </span>

          <span>
            {cart.totalQuantity.toLocaleString("fa-IR")}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            اقلام سبد
          </span>

          <span>
            {cart.itemsCount.toLocaleString("fa-IR")}
          </span>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              مبلغ قابل پرداخت
            </span>

            <span className="text-lg font-bold">
              {formatPrice(cart.subtotal)}
            </span>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={isUpdating || cart.items.length === 0}
          onClick={() => navigate("/checkout")}
        >
          ادامه و تسویه حساب
        </Button>

        <Button
          variant="outline"
          className="w-full"
          disabled={isUpdating}
          onClick={() => navigate("/products")}
        >
          ادامه خرید
        </Button>
      </CardContent>
    </Card>
  );
}
