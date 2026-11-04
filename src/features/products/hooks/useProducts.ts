import { useQuery } from "@tanstack/react-query";

import {
  getProducts,
  type GetProductsParams,
} from "@/services/products.api";
import { useSelectedBranchId } from "@/hooks/useSelectedBranchId";

export function useProducts(params: GetProductsParams = {}) {
  const branchId = useSelectedBranchId();
  return useQuery({
    queryKey: ["products", params, branchId],
    queryFn: () => getProducts(params),
    placeholderData: (previousData)=> previousData,
  });
}
