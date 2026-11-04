import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/services/cart.api";
import { getSelectedBranchId } from "@/lib/store-branch";

export function useCart() {
  return useQuery({
    queryKey: ["cart", getSelectedBranchId()],
    queryFn: getCart,
  });
}
