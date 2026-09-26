import { apiClient } from "./api/client";

export interface AuthUser {
    RowID: number;
    RowName?: string;
    RowCode?: string;
    MobileNumber?: string;
    MobileForSMS?: string;
}

export interface AuthSession {
    sessionId: string;
    kind: "customer" | "admin";
    createdAt?: number;
    lastActivityAt: number;
    absoluteExpiresAt: number;
    idleExpiresAt: number;
}

export interface AuthResponse {
  user: AuthUser;
  session: AuthSession;
}

interface RequestOtpResponse {
  success: boolean;
  message: string;
  data?: {
    developmentOtp?: string;
  };
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: AuthResponse;
}

interface MeResponse {
  success: boolean;
  data: {
    kind: "customer" | "admin";
    user: AuthUser;
    session: AuthSession;
  };
}

export async function requestCustomerOtp(
  mobile: string,
) {

    console.log(mobile);

  const response =
    await apiClient.post<RequestOtpResponse>(
      "/api/auth/customer/request-otp",
      {
        mobile,
      },
    );

console.log(response.data)
  return response.data;
}

export async function verifyCustomerOtp(
  mobile: string,
  code: string,
) {
  const response =
    await apiClient.post<VerifyOtpResponse>(
      "/api/auth/customer/verify-otp",
      {
        mobile,
        code,
      },
    );

  return response.data.data;
}

export async function getCurrentUser() {
  const response =
    await apiClient.get<MeResponse>(
      "/api/auth/me",
    );

  return response.data.data;
}

export async function logout() {
  await apiClient.post(
    "/api/auth/logout",
  );
}
