import { getApiErrorMessage } from "@/services/api/errors";
import { apiClient } from "@/services/api/client";

export type CategoryVisibilityFilter = "all" | "visible" | "hidden";

export interface AdminCategory {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  parentName: string | null;
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
    throw new Error(getApiErrorMessage(error, "دریافت دسته‌بندی‌ها ناموفق بود."));
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
    throw new Error(getApiErrorMessage(error, "تغییر وضعیت نمایش دسته‌بندی ناموفق بود."));
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
    throw new Error(getApiErrorMessage(error, "ذخیره ترتیب نمایش ناموفق بود."));
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
    throw new Error(getApiErrorMessage(error, "ذخیره آیکون دسته‌بندی ناموفق بود."));
  }
}
