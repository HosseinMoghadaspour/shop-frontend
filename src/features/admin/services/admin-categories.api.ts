import { apiClient } from "@/services/api/client";

export type CategoryVisibilityFilter = "all" | "visible" | "hidden";

export interface AdminCategory {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  isActive: boolean;
  isVisible: boolean;
  sortOrder: number;
  image: string | null;
  iconName: string | null;
}

export interface AdminCategoriesResult {
  categories: AdminCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ListResponse {
  success: boolean;
  message?: string;
  data: AdminCategory[];
  pagination: AdminCategoriesResult["pagination"];
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as { response?: { data?: { message?: string; error?: { message?: string } } } }
    ).response;

    if (response?.data?.message) return response.data.message;
    if (response?.data?.error?.message) return response.data.error.message;
  }

  return error instanceof Error ? error.message : fallback;
}

export async function getAdminCategories(params: {
  search?: string;
  visibility: CategoryVisibilityFilter;
  page: number;
  limit: number;
}): Promise<AdminCategoriesResult> {
  try {
    const response = await apiClient.get<ListResponse>("/admin/categories", {
      params,
    });

    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error(response.data.message || "پاسخ فهرست دسته‌بندی‌ها معتبر نیست.");
    }

    return {
      categories: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, "دریافت دسته‌بندی‌ها ناموفق بود."));
  }
}

export async function setCategoryVisibility(id: number, isVisible: boolean) {
  try {
    const response = await apiClient.patch<ApiResponse<{ id: number; isVisible: boolean }>>(
      `/admin/categories/${id}/visibility`,
      { isVisible },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "تغییر وضعیت نمایش دسته‌بندی ناموفق بود."));
  }
}

export async function setCategoryDisplayOrder(id: number, sortOrder: number) {
  try {
    const response = await apiClient.patch<ApiResponse<{ id: number; sortOrder: number }>>(
      `/admin/categories/${id}/display-order`,
      { sortOrder },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "ذخیره ترتیب نمایش ناموفق بود."));
  }
}

export async function setCategoryIcon(id: number, iconName: string | null) {
  try {
    const response = await apiClient.patch<ApiResponse<{ id: number; iconName: string | null }>>(
      `/admin/categories/${id}/icon`,
      { iconName },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "ذخیره آیکون دسته‌بندی ناموفق بود."));
  }
}
