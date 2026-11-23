import { getApiErrorMessage } from "@/services/api/errors";
import { apiClient } from "@/services/api/client";

export interface AdminOrderStatus {
  RowID: number;
  RowName: string;
  RowDesc: string | null;
}

export interface AdminOrder {
  id: number;
  docNo: number;
  date: string;
  totalPrice: number | null;
  discountPrice: number | null;
  taxPrice: number | null;
  payablePrice: number | null;
  customerId: number | null;
  customerMobile: string | null;
  deliveryStatusId: number | null;
  deliveryStatusName: string;
  sendStatusId: number | null;
  sendStatusName: string;
  paymentStatusId: number | null;
  paymentStatusName: string;
  paymentMethodName: string;
  orderStatus: boolean | null;
  shippingCost?: number | null;
  workflow?: {
    status: number;
    shippingCost: number | null;
    adminNote: string | null;
    quoteExpiresAt: string | null;
    customerAcceptedAt?: string | null;
  } | null;
}

export interface AdminOrderDetail extends AdminOrder {
  shippingCost: number | null;
  note: string | null;
  address: {
    recipient: string | null;
    mobile: string | null;
    postalCode: string | null;
    address: string | null;
  } | null;
  items: Array<{
    id: number;
    goodId: number;
    code: string | null;
    name: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AdminOrdersResult {
  items: AdminOrder[];
  statuses: {
    delivery: AdminOrderStatus[];
    send: Array<{ RowID: number; RowName: string | null }>;
    payment: AdminOrderStatus[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getAdminOrders(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<AdminOrdersResult> {
  try {
    const response = await apiClient.get<ApiResponse<AdminOrder[]>>("/admin/orders", { params });
    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error(response.data.message || "پاسخ سفارش‌ها معتبر نیست.");
    }
    return {
      items: response.data.data,
      statuses: (response.data as ApiResponse<AdminOrder[]> & {
        statuses: AdminOrdersResult["statuses"];
        pagination: AdminOrdersResult["pagination"];
      }).statuses,
      pagination: (response.data as ApiResponse<AdminOrder[]> & {
        pagination: AdminOrdersResult["pagination"];
      }).pagination,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "دریافت سفارش‌ها ناموفق بود."));
  }
}

export async function getAdminOrderById(id: number): Promise<AdminOrderDetail> {
  try {
    const response = await apiClient.get<ApiResponse<AdminOrderDetail>>(`/admin/orders/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "سفارش پیدا نشد.");
    }
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "دریافت جزئیات سفارش ناموفق بود."));
  }
}

export async function updateAdminOrderStatus(
  id: number,
  data: { deliveryStatusId?: number; paymentStatusId?: number; sendStatusId?: number },
): Promise<void> {
  try {
    const response = await apiClient.patch<ApiResponse<null>>(`/admin/orders/${id}/status`, data);
    if (!response.data.success) throw new Error(response.data.message || "به‌روزرسانی وضعیت ناموفق بود.");
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "به‌روزرسانی وضعیت سفارش ناموفق بود."));
  }
}

export async function setAdminShippingQuote(
  id: number,
  data: { shippingCost: number; adminNote?: string; expiresAt?: string },
): Promise<void> {
  try {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/admin/orders/${id}/shipping-quote`,
      data,
    );
    if (!response.data.success) throw new Error(response.data.message || "ثبت هزینه ارسال ناموفق بود.");
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "ثبت هزینه ارسال ناموفق بود."));
  }
}
