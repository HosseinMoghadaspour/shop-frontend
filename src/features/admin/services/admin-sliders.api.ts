import { apiClient } from "@/services/api/client";

export interface AdminSlider {
  RowID: string;
  UrlImage: string | null;
  DescImage: string | null;
  DescBut: string | null;
  UrlSend: string | null;
  Status: boolean | null;
  Type: number | null;
  Description: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return error instanceof Error ? error.message : fallback;
}

export async function getAdminSliders(): Promise<AdminSlider[]> {
  const response = await apiClient.get<ApiResponse<AdminSlider[]>>("/admin/sliders");
  return response.data.data;
}

export async function createAdminSlider(data: {
  DescImage: string;
  Description: string;
  DescBut: string;
  UrlSend: string;
}) {
  try {
    const response = await apiClient.post<ApiResponse<AdminSlider>>("/admin/sliders", {
      ...data,
      Status: false,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(errorMessage(error, "ساخت اسلایدر ناموفق بود."));
  }
}

export async function updateAdminSlider(
  id: string,
  data: {
    DescImage: string;
    Description: string;
    DescBut: string;
    UrlSend: string;
    Status: boolean;
  },
) {
  try {
    const response = await apiClient.patch<ApiResponse<AdminSlider>>(`/admin/sliders/${id}`, data);
    return response.data.data;
  } catch (error) {
    throw new Error(errorMessage(error, "ذخیره تغییرات اسلایدر ناموفق بود."));
  }
}

export async function uploadAdminSliderImage(id: string, file: File) {
  const formData = new FormData();
  formData.append("image", file);
  try {
    const response = await apiClient.post<ApiResponse<AdminSlider>>(
      `/admin/sliders/${id}/image`,
      formData,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(errorMessage(error, "بارگذاری تصویر اسلایدر ناموفق بود."));
  }
}

export async function deleteAdminSlider(id: string) {
  try {
    await apiClient.delete(`/admin/sliders/${id}`);
  } catch (error) {
    throw new Error(errorMessage(error, "حذف اسلایدر ناموفق بود."));
  }
}
