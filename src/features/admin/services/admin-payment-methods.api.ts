
import { apiClient } from "@/services/api/client";

export interface AdminPaymentMethod {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  enName: string | null;
  onlinePayType: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getAdminPaymentMethods() {
  const response = await apiClient.get<
    ApiResponse<AdminPaymentMethod[]>
  >("/admin/payment-methods");

  return response.data.data;
}

export async function updateAdminPaymentMethod(
  id: number,
  isActive: boolean,
) {
  const response = await apiClient.patch<
    ApiResponse<AdminPaymentMethod>
  >(`/admin/payment-methods/${id}`, {
    isActive,
  });

  return response.data.data;
}
