import { apiClient } from "./api/client";
import type { ApiResponse } from "./api/types";

export interface SendOtpRequest {
    mobile: string;
}

export interface SendOtpResponce {
    expiresIn : number;
    retryAfter?: number;
}


export async function sendotp(payload: SendOtpRequest) {

    const response = await apiClient.post<ApiResponse<SendOtpResponce>>("/api/auth/customer/request-otp", payload);

    return response.data;
}
