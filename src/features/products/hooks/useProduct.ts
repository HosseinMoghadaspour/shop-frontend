import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/services/products.api";

export function useProduct(productId: number) {
    return useQuery({
        queryKey: ["product", productId],
        queryFn: ()=>getProduct(productId),
        enabled: Number.isFinite(productId) && productId > 0,
    });
}
