import { apiClient } from "./api/client";

export interface OrderDeliveryAddress {
  cityId: number;
  deliverToName: string;
  deliverToMobileNumber: string;
  deliverToPhoneNumber?: string;
  Adrs: string;
  PostalCode?: string;
  RowDesc?: string;
}

export interface CreateOrderRequest {
  deliveryAddress:
    | {
        addressId: number;
      }
    | OrderDeliveryAddress;
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

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface OrderHeader {
  RowID: number;
  DocNo: number;
  FDate: string;
  MDate: string | null;
  TotalPrice: number | null;
  DiscountPercent: number | null;
  DiscountPrice: number | null;
  PayablePrice: number | null;
  TaxPercent: number | null;
  OrderStatus: boolean | null;
}

export interface OrderProduct {
  RowID: number;
  RowCode: string | null;
  RowName: string | null;
  RowNameEN: string | null;
  RowNameAlias: string | null;
  SalePrice: number | null;
  DiscountPrice: number | null;
  IMG_1: string | null;
}

export interface OrderDetail {
  OrderH_ID: number;
  Good_ID: number;
  MeasureUnit_ID: number | null;
  OutputValue: number;
  UnitPrice: number;
  TotalPrice: number;
  PurchaseTotalPrice: number | null;
  PurchaseUnitPrice: number | null;
  Good: OrderProduct | null;
}

export interface OrdersResponse {
  orderH: OrderHeader[];
  orderD: OrderDetail[];
}

export interface OrderDetailResponse {
  orderH: OrderHeader | null;
  orderD: OrderDetail[];
}

export async function createOrder(
  data: CreateOrderRequest,
): Promise<CreateOrderResponse> {
  const response =
    await apiClient.post<ApiResponse<CreateOrderResponse>>(
      "/orders",
      data,
    );

  return response.data.data;
}

export async function getOrders(): Promise<OrdersResponse> {
  const response =
    await apiClient.get<ApiResponse<OrdersResponse>>(
      "/orders",
    );

  return response.data.data;
}

export async function getOrderById(
  id: number,
): Promise<OrderDetailResponse> {
  const response =
    await apiClient.get<ApiResponse<OrderDetailResponse>>(
      `/orders/${id}`,
    );

  return response.data.data;
}

export const submitOrder = createOrder
