import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/services/cart.api";
import { useSelectedBranchId } from "@/hooks/useSelectedBranchId";

export function useCart() {
  const branchId = useSelectedBranchId();
  return useQuery({
    queryKey: ["cart", branchId],
    queryFn: getCart,
  });
}
