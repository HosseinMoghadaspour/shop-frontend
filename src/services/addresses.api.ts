import { apiClient } from "./api/client";

export interface AddressLocation {
    id: number;
    name: string;
}

export interface DeliveryAddress {
    id: number;
    personId: number;
    recipient: {
        name: string | null;
        mobile: string | null;
        phone: string | null;
    };
    address: string | null;
    postalCode: string | null;
    isActive: boolean;
    cityId: number | null;
    city: AddressLocation | null;
    county: AddressLocation | null;
    province: AddressLocation | null;
}

interface AddressesResponse {
    success: boolean;
    data: DeliveryAddress[];
}


export async function getMyAddresses(): Promise<DeliveryAddress[]> {
    const response = await apiClient.get<AddressesResponse>("/locations/address/me");
    return response.data.data;
}
