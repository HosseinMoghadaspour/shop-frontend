import { apiClient } from "@/services/api/client";

export interface AdminOrderRequest {
  id: number;
  orderId: number;
  orderDocNo: number;
  orderDate: string;
  payablePrice: number | null;
  customerId: number;
  customerName: string | null;
  customerMobile: string | null;
  requestType: 1 | 2;
  message: string;
  status: 1 | 2 | 3 | 4;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getAdminOrderRequests(status?: number) {
  const response = await apiClient.get<ApiResponse<AdminOrderRequest[]> & {
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>("/admin/order-requests", { params: { page: 1, limit: 100, ...(status ? { status } : {}) } });
  if (!response.data.success) throw new Error(response.data.message || "دریافت درخواست‌ها ناموفق بود.");
  return { items: response.data.data, pagination: response.data.pagination };
}

export async function updateAdminOrderRequest(
  id: number,
  status: number,
  adminResponse: string,
) {
  const response = await apiClient.patch<ApiResponse<null>>(
    `/admin/order-requests/${id}`,
    { status, adminResponse },
  );
  if (!response.data.success) throw new Error(response.data.message || "به‌روزرسانی درخواست ناموفق بود.");
}
