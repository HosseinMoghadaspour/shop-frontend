import { apiClient } from "./api/client";

export interface Province {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  countyId: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function getProvinces(): Promise<Province[]> {
  const response = await apiClient.get<ApiResponse<Province[]>>(
    "/locations/provinces",
  );

  return response.data.data;
}

export async function getCitiesByProvince(
  provinceId: number,
): Promise<City[]> {
  const response = await apiClient.get<ApiResponse<City[]>>(
    `/locations/provinces/${provinceId}/cities`,
  );

  return response.data.data;
}
