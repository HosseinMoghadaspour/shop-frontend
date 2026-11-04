
import { apiClient } from "@/services/api/client";

export interface AdminBankAccount {
  RowID: number;
  RowCode: string | null;
  RowName: string | null;
  IsActive: boolean;

  OnlineShop_IsShow: boolean | null;
  OnlineShop_BankName: string | null;
  OnlineShop_AccountNumber: string | null;
  OnlineShop_CardNumber: string | null;
  OnlineShop_AccountOwnerName: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getAdminBankAccounts() {
  const response = await apiClient.get<
    ApiResponse<AdminBankAccount[]>
  >("/admin/bank-accounts");

  return response.data.data;
}

export async function updateAdminBankAccountVisibility(
  id: number,
  isShow: boolean,
) {
  const response = await apiClient.patch<
    ApiResponse<AdminBankAccount>
  >(`/admin/bank-accounts/${id}`, {
    OnlineShop_IsShow: isShow,
  });

  return response.data.data;
}
