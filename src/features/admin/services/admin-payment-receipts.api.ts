import { getApiErrorMessage } from "@/services/api/errors";

import { apiClient } from "@/services/api/client";

export interface AdminPaymentReceipt {
  id: string;
  docNo: string;
  orderDate: string | null;
  createdAt: string | null;

  totalPrice: number | null;
  payableAmount: number | null;
  depositAmount: number | null;

  trackingNumber: string | null;

  depositDate: {
    year: string | null;
    month: string | null;
    day: string | null;
  };

  depositTime: {
    hour: string | null;
    minute: string | null;
  };

  lastFourDigits: string | null;

  customer: {
    id: number;
    name: string | null;
    mobile: string | null;
  } | null;

  bankAccount: {
    id: number;
    bankName: string | null;
    cardNumber: string | null;
    accountNumber: string | null;
    ownerName: string | null;
  } | null;

  paymentStatus: {
    id: number;
    name: string;
  } | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getPendingPaymentReceipts(): Promise<
  AdminPaymentReceipt[]
> {
  try {
    const response = await apiClient.get<
      ApiResponse<AdminPaymentReceipt[]>
    >("/admin/payment-receipts");

    return response.data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "دریافت رسیدهای پرداخت ناموفق بود."),
    );
  }
}

export async function approvePaymentReceipt(orderId: string) {
  try {
    const response = await apiClient.patch<
      ApiResponse<{
        orderId: string;
        paymentStatusId: number;
        message: string;
      }>
    >(`/admin/payment-receipts/${orderId}/approve`);

    return response.data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "تأیید رسید پرداخت ناموفق بود."),
    );
  }
}

export async function rejectPaymentReceipt(orderId: string) {
  try {
    const response = await apiClient.patch<
      ApiResponse<{
        orderId: string;
        paymentStatusId: number;
        message: string;
      }>
    >(`/admin/payment-receipts/${orderId}/reject`);

    return response.data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "رد رسید پرداخت ناموفق بود."),
    );
  }
}
