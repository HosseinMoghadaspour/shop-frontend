import { useQuery } from "@tanstack/react-query";

import {
  getProducts,
  type GetProductsParams,
} from "@/services/products.api";
import { getSelectedBranchId } from "@/lib/store-branch";

export function useProducts(params: GetProductsParams = {}) {
  return useQuery({
    queryKey: ["products", params, getSelectedBranchId()],
    queryFn: () => getProducts(params),
    placeholderData: (previousData)=> previousData,
  });
}
