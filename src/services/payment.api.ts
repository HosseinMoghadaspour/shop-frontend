import { apiClient } from "./api/client";

export interface PaymentMethod {
  rowId: number;
  name: string;
  description: string | null;
  onlinePayType: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await apiClient.get<ApiResponse<PaymentMethod[]>>("/payment/methods");
  return response.data.data;
}
