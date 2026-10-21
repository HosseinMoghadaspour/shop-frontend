import { apiClient } from "@/services/api/client";

export interface AdminDashboardStats {
  products: { total: number; visible: number; hidden: number };
  categories: { total: number; visible: number; hidden: number };
}

interface DashboardResponse {
  success: boolean;
  message?: string;
  data: AdminDashboardStats;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  try {
    const response = await apiClient.get<DashboardResponse>("/admin/dashboard");
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "پاسخ آمار داشبورد معتبر نیست.");
    }
    return response.data.data;
  } catch (error) {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (error as { response?: { data?: { message?: string } } }).response;
      if (response?.data?.message) throw new Error(response.data.message);
    }
    throw new Error(error instanceof Error ? error.message : "دریافت آمار داشبورد ناموفق بود.");
  }
}
