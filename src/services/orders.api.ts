import { apiClient } from "./api/client";

export interface OrderDeliveryAddress {
    provinceId: number;
    deliverToName: string;
    deliverToMobileNumber: string;
    deliverToPhoneNumber?: string;
    City: string;
    Adrs:string;
    PostalCode?: string;
    RowDesc?: string;
    FDateInset?: string;
    FTimeInsert?: string;
}

export interface CreateOrderRequest {
    deliveryAddress: OrderDeliveryAddress;
}

export interface OrderItemResponse {
    goodId: number;
    goodCode: string;
    goodName: string;
    quantity: number;
    unitPrice: number;
    mainMeasureUnitId: number;
    defaultMeasureUnitId: number;
    discountPrice: number;
    totalPrice: number;
}

export interface CreateOrderResponse {
  whDocHId: number;
  whDocD: number;
  orderHId: number;
  orderD: number;
  docNo: number;
  personId: number;
  deliveryAddressId: number;
  totalPrice: number;
  discountPrice: number;
  taxPrice: number;
  payablePrice: number;
  items: OrderItemResponse[];
}

export const createOrder = async (
  data: CreateOrderRequest,
): Promise<CreateOrderResponse> => {
  const response = await apiClient.post<CreateOrderResponse>(
    "/orders",
    data,
  );

  return response.data;
};
