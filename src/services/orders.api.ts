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
  branchId: number;
  paymentMethodId: number;
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
  mainMeasureUnitId: number | null;
  defaultMeasureUnitId: number | null;
  unit: {
    id: number;
    name: string;
    weightOrAmount: number | null;
  } | null;

  discountPrice: number;
  totalPrice: number;
}

export interface CreateOrderResponse {
  whDocHId: number | null;
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
  TaxPercent: number | null;
  TaxPrice: number | null;
  PayablePrice: number | null;
  ShippingCost: number | null;
  WorkflowStatusId: number | null;
  ShippingQuote: {
    shippingCost: number | null;
    adminNote: string | null;
    expiresAt: string | null;
  } | null;
  OrderStatus: boolean | null;
  DeliveryStatusName?: string | null;
  SendStatusId?: number | null;
  SendStatusName?: string | null;
  PaymentStatusName?: string | null;
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
  sendStatuses: Array<{ RowID: number; RowName: string | null }>;
}

export async function createOrder(
  data: CreateOrderRequest,
  idempotencyKey: string,
): Promise<CreateOrderResponse> {
  const response =
    await apiClient.post<ApiResponse<CreateOrderResponse>>(
      "/orders",
      data,
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      },
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

export interface OrderRequest {
  id: number;
  requestType: 1 | 2;
  message: string;
  status: 1 | 2 | 3 | 4;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export async function getOrderRequests(orderId: number): Promise<OrderRequest[]> {
  const response = await apiClient.get<ApiResponse<OrderRequest[]>>(
    `/orders/${orderId}/requests`,
  );
  if (!response.data.success) {
    throw new Error(response.data.message || "دریافت درخواست‌ها ناموفق بود.");
  }
  return response.data.data;
}

export async function createOrderRequest(
  orderId: number,
  requestType: 1 | 2,
  message = "",
): Promise<OrderRequest> {
  const response = await apiClient.post<ApiResponse<OrderRequest>>(
    `/orders/${orderId}/requests`,
    { requestType, message },
  );
  if (!response.data.success) {
    throw new Error(response.data.message || "ثبت درخواست ناموفق بود.");
  }
  return response.data.data;
}

export async function confirmOrderTotal(orderId: number, accepted: boolean): Promise<void> {
  const response = await apiClient.post<ApiResponse<unknown>>(
    `/orders/${orderId}/confirm-total`,
    { accepted },
  );
  if (!response.data.success) {
    throw new Error(response.data.message || "ثبت پاسخ مبلغ نهایی ناموفق بود.");
  }
}
