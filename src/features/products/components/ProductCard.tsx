import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/formatter";
import { getApiAssetUrl } from "@/lib/api-url";
import type { Product } from "@/services/products.api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const {
    name,
    // nameEn,
    stockInfo,
    pricing,
    images,
    isSpecialSale,
    amazingSale,
  } = product;

  const hasImage = images.length > 0;
  const isAvailable = stockInfo[0]?.quantity && stockInfo[0].quantity > 0;

  return (
    <Card className="group h-full w-full overflow-hidden border border-emerald-950/5 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/8">
      {/* Product image */}
      <Link
        to={`/products/${product.id}`}
        className="relative block overflow-hidden"
      >
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#f3f6f3] p-3 sm:p-5">
          {hasImage ? (
            <img
              src={getApiAssetUrl(images[0].url)}
              alt={name}
              loading="lazy"
              className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <span className="text-sm text-muted-foreground">تصویر محصول</span>
          )}
        </div>

        {(isSpecialSale || amazingSale) && (
          <Badge className="absolute right-3 top-3 rounded-full bg-primary px-3 text-[10px] shadow-sm">
            {amazingSale ? "فروش شگفت‌انگیز" : "فروش ویژه"}
          </Badge>
        )}
      </Link>

      <CardContent className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Product name */}
        <Link to={`/products/${product.id}`}>
          <h2 className="line-clamp-2 min-h-12 text-sm font-semibold leading-6 transition-colors group-hover:text-primary sm:text-base">
            {name}
          </h2>
        </Link>

        {/* {nameEn && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {nameEn}
          </p>
        )} */}

        {/* Code */}
        {/* <p className="mt-3 text-xs text-muted-foreground">کد کالا: {code}</p> */}

        {/* Price */}
        <div className="mt-auto pt-4">
          {pricing.hasDiscount && pricing.discountPercent !== null && (
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(pricing.salePrice)}
              </span>

              <Badge variant="destructive" className="rounded-full">
                {pricing.discountPercent.toLocaleString("fa-IR")}٪
              </Badge>
            </div>
          )}

          <p className="text-base font-extrabold text-primary sm:text-lg">{formatPrice(pricing.finalPrice)} <span className="text-xs font-normal text-muted-foreground">تومان</span></p>
        </div>

        {/* Stock */}
        <div className="mt-2">
          {isAvailable ? (
            <span className="text-xs text-muted-foreground">
              موجودی: {stockInfo[0]?.quantity?.toLocaleString("fa-IR")}
            </span>
          ) : (
            <span className="text-xs text-destructive">ناموجود</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-0 bg-transparent p-3 pt-0 sm:p-4 sm:pt-0">
        <Link
          to={`/products/${product.id}`}
          aria-disabled={!isAvailable}
          className={[
            "mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition",
            isAvailable
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "pointer-events-none bg-muted text-muted-foreground",
          ].join(" ")}
        >
          {isAvailable ? "مشاهده و خرید" : "ناموجود"}
          <ArrowLeft className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
