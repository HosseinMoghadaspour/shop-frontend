import { apiClient } from "./api/client";

export interface StoreBranch {
  id: number;
  name: string;
  cityId: number;
  cityName: string;
  salePriceTypeId: number | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  distanceKm: number | null;
}

export interface AdminBranchRecord {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  isMainBranch: boolean;
  cityId: number | null;
  cityName: string | null;
  salePriceTypeId: number | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  isConfigured: boolean;
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

export async function getAdminBranches(): Promise<AdminBranchRecord[]> {
  const response = await apiClient.get<{
    success: boolean;
    data: AdminBranchRecord[];
  }>("/branches/admin");
  return response.data.data;
}

export async function saveAdminBranch(
  branchId: number,
  data: {
    cityId: number;
    salePriceTypeId: number | null;
    address: string;
    latitude: number | null;
    longitude: number | null;
    isActive: boolean;
    isDefault: boolean;
  },
): Promise<void> {
  await apiClient.put(`/branches/admin/${branchId}`, data);
}

export interface AdminBranchOption {
  branchId: number;
  branchName: string;
  description: string | null;
  cityId: number | null;
  cityName: string | null;
  provinceId: number | null;
  salePriceTypeId: number | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean | null;
  isDefault: boolean | null;
}

export async function getAdminBranchOptions(): Promise<AdminBranchOption[]> {
  const response = await apiClient.get<{
    success: boolean;
    data: AdminBranchOption[];
  }>("/branches/admin/options");
  return response.data.data;
}
