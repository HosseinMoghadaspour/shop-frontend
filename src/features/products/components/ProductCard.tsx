import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/formatter";
import type { Product } from "@/services/products.api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const {
    name,
    nameEn,
    code,
    stock,
    pricing,
    images,
    isSpecialSale,
    amazingSale,
  } = product;

  const hasImage = images.length > 0;
  const isAvailable = stock > 0;

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      {/* Product image */}
      <Link
        to={`/products/${product.id}`}
        className="relative block overflow-hidden"
      >
        <div className="flex aspect-square items-center justify-center bg-muted">
          {hasImage ? (
            <img
              src={images[0].url}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-sm text-muted-foreground">بدون تصویر</span>
          )}
        </div>

        {(isSpecialSale || amazingSale) && (
          <Badge className="absolute right-3 top-3">
            {amazingSale ? "فروش شگفت‌انگیز" : "فروش ویژه"}
          </Badge>
        )}
      </Link>

      <CardContent className="p-4">
        {/* Product name */}
        <Link to={`/products/${product.id}`}>
          <h2 className="line-clamp-2 min-h-12 font-semibold transition-colors group-hover:text-primary">
            {name}
          </h2>
        </Link>

        {nameEn && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {nameEn}
          </p>
        )}

        {/* Code */}
        <p className="mt-3 text-xs text-muted-foreground">کد کالا: {code}</p>

        {/* Price */}
        <div className="mt-4">
          {pricing.hasDiscount && pricing.discountPercent !== null && (
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(pricing.salePrice)}
              </span>

              <Badge variant="destructive">
                {pricing.discountPercent.toLocaleString("fa-IR")}٪
              </Badge>
            </div>
          )}

          <p className="text-lg font-bold">{formatPrice(pricing.finalPrice)}</p>
        </div>

        {/* Stock */}
        <div className="mt-2">
          {isAvailable ? (
            <span className="text-xs text-muted-foreground">
              موجودی: {stock.toLocaleString("fa-IR")}
            </span>
          ) : (
            <span className="text-xs text-destructive">ناموجود</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={!isAvailable}
          onClick={() => {
            window.location.href = `/products/${product.id}`;
          }}
        >
          <ShoppingCart className="ml-2 h-4 w-4" />
          {isAvailable ? "افزودن به سبد" : "ناموجود"}
        </Button>
      </CardFooter>
    </Card>
  );
}
