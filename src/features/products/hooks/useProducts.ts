import { useQuery } from "@tanstack/react-query";

import {
  getProducts,
  type GetProductsParams,
} from "@/services/products.api";

export function useProducts(params: GetProductsParams = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
    placeholderData: (previousData)=> previousData,
  });
}
