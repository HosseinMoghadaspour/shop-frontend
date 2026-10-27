import type { Product } from "@/services/products.api";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  horizontal?: boolean;
}

export function ProductGrid({ products, horizontal = false }: ProductGridProps) {
  if (horizontal) {
    return (
      <div
        dir="ltr"
        className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] @sm:gap-4"
      >
        {products.map((product) => (
          <div key={product.id} dir="rtl" className="w-[168px] shrink-0 snap-start @sm:w-[205px] @lg:w-[220px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 @sm:grid-cols-3 @sm:gap-4 @lg:grid-cols-4 @xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
