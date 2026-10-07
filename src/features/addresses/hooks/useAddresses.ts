import { useQuery } from "@tanstack/react-query";
import { getMyAddresses } from "@/services/addresses.api";

export function useAddresses() {
    return useQuery({
        queryKey: ["addresses"],
        queryFn: getMyAddresses,
    });
}
