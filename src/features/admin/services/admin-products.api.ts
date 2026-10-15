
import { apiClient } from "@/services/api/client";

export interface AdminProductImage {
  id: number;
  url: string | null;
  alt: string | null;
  isDefault: boolean;
}

export interface AdminProduct {
  id: number;
  code: string | null;
  name: string | null;
  nameEn: string | null;
  alias: string | null;
  salePrice: number;
  discountPrice: number | null;
  isActive: boolean | null;
  isVisible: boolean;
  images: AdminProductImage[];
}

export interface AdminProductsResult {
  products: AdminProduct[];
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
  data: AdminProduct[];
  pagination: AdminProductsResult["pagination"];
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: { data?: { message?: string } };
      }
    ).response;

    if (response?.data?.message) return response.data.message;
  }

  return error instanceof Error ? error.message : fallback;
}

export async function getAdminProducts(params: {
  search?: string;
  visibility: "all" | "visible" | "hidden";
  page: number;
  limit: number;
}): Promise<AdminProductsResult> {
  const response = await apiClient.get<ListResponse>(
    "/admin/products",
    { params },
  );

  return {
    products: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function setProductVisibility(
  productId: number,
  isVisible: boolean,
) {
  try {
    const response = await apiClient.patch<
      ApiResponse<{ id: number; isVisible: boolean }>
    >(`/admin/products/${productId}/visibility`, { isVisible });

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "تغییر وضعیت نمایش کالا ناموفق بود."));
  }
}

export async function uploadProductImages(
  productId: number,
  files: FileList | File[],
) {
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("images", file);
  });

  try {
    const response = await apiClient.post<ApiResponse<AdminProductImage[]>>(
      `/admin/products/${productId}/images`,
      formData,
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "بارگذاری تصاویر ناموفق بود."));
  }
}

export async function setDefaultProductImage(
  productId: number,
  imageId: number,
) {
  try {
    await apiClient.patch(
      `/admin/products/${productId}/images/${imageId}/default`,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "تغییر تصویر پیش‌فرض ناموفق بود."));
  }
}

export async function deleteProductImage(
  productId: number,
  imageId: number,
) {
  try {
    await apiClient.delete(
      `/admin/products/${productId}/images/${imageId}`,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "حذف تصویر ناموفق بود."));
  }
}
