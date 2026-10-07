import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/services/cart.api";

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });
}
