import { apiClient } from "./api/client";

export interface CustomerProfile {
  id: number;
  fullName: string;
  mobile: string | null;
  phoneNumber: string;
  email: string;
  nationalCode: string;
  isComplete: boolean;
}

export interface UpdateCustomerProfileInput {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  nationalCode?: string;
}

interface ProfileResponse {
  success: boolean;
  data: CustomerProfile;
}

export async function getMyProfile(): Promise<CustomerProfile> {
  const response = await apiClient.get<ProfileResponse>("/api/profile/me");
  return response.data.data;
}

export async function updateMyProfile(input: UpdateCustomerProfileInput): Promise<CustomerProfile> {
  const response = await apiClient.patch<ProfileResponse>("/api/profile/me", input);
  return response.data.data;
}
