import { apiClient } from "./api/client";

export interface StoreBranch {
  id: number;
  name: string;
  cityId: number;
  cityName: string;
  warehouseId: number;
  salePriceTypeId: number | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  distanceKm: number | null;
}

interface BranchesResponse {
  success: boolean;
  data: StoreBranch[];
  defaultBranchId: number | null;
}

export async function getBranchesByCity(
  cityId: number,
  coordinates?: { latitude: number; longitude: number },
): Promise<BranchesResponse> {
  const response = await apiClient.get<BranchesResponse>("/branches", {
    params: { cityId, ...coordinates },
  });
  return response.data;
}

export async function getAdminBranches(): Promise<StoreBranch[]> {
  const response = await apiClient.get<{ success: boolean; data: StoreBranch[] }>("/branches/admin");
  return response.data.data;
}

export async function saveAdminBranch(
  branchId: number,
  data: {
    cityId: number;
    warehouseId: number;
    salePriceTypeId: number | null;
    latitude: number | null;
    longitude: number | null;
    isActive: boolean;
    isDefault: boolean;
  },
): Promise<void> {
  await apiClient.put(`/branches/admin/${branchId}`, data);
}
