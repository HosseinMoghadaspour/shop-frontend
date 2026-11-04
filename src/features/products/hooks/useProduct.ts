import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/services/products.api";
import { useSelectedBranchId } from "@/hooks/useSelectedBranchId";

export function useProduct(productId: number) {
    const branchId = useSelectedBranchId();
    return useQuery({
        queryKey: ["product", productId, branchId],
        queryFn: ()=>getProduct(productId),
        enabled: Number.isFinite(productId) && productId > 0,
    });
}
