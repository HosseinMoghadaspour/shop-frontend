import type { Product } from "@/services/products.api";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 ">
      {products.map((products) => (
        <ProductCard key={products.id} product={products} />
      ))}
    </div>
  );
}
