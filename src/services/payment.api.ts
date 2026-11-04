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

export interface StartPaymentResponse {
  orderId: string;
  paymentMethodId: number;
  paymentMethodName: string;
  paymentMethodType: "CARD_TO_CARD" | "PAY_IN_PLACE" | "GATEWAY";
  paymentStatusId: number;
  paymentStatusName: string;
  payableAmount: number;
  message: string;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await apiClient.get<ApiResponse<PaymentMethod[]>>("/payment/methods");
  return response.data.data;
}

export interface PublicBankAccount {
  id: number;
  bankName: string | null;
  accountNumber: string | null;
  cardNumber: string | null;
  accountOwnerName: string | null;
}

export async function getPublicBankAccounts(): Promise<PublicBankAccount[]> {
  const response = await apiClient.get<ApiResponse<PublicBankAccount[]>>(
    "/payment/bank-accounts",
  );

  return response.data.data;
}

export async function startOrderPayment(
  orderId: number,
): Promise<StartPaymentResponse> {
  const response = await apiClient.post<ApiResponse<StartPaymentResponse>>(
    `/payment/order/${orderId}`,
  );

  return response.data.data;
}
