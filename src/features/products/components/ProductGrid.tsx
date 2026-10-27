import type { Product } from "@/services/products.api";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  horizontal?: boolean;
}

export function ProductGrid({
  products,
  horizontal = false,
}: ProductGridProps) {
  if (horizontal) {
    return (
      <div
        className="
          flex w-full snap-x snap-mandatory gap-3
          overflow-x-auto overscroll-x-contain pb-3
          [scrollbar-color:#cbd5e1_transparent]
          [scrollbar-width:thin]
          sm:gap-4
        "
      >
        {products.map((product) => (
          <div
            key={product.id}
            dir="rtl"
            className="
              w-[clamp(145px,42vw,190px)]
              shrink-0 snap-start
              sm:w-[clamp(190px,24vw,230px)]
            "
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="
        grid grid-cols-2 items-stretch gap-2.5
        sm:grid-cols-3 sm:gap-4
        lg:grid-cols-4
        xl:grid-cols-5
      "
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
