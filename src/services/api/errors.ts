import axios from "axios";
import type { ApiErrorResponse } from "./types";

export class ApiError extends Error {
  status: number;
  data: ApiErrorResponse;

  constructor(message: string, status: number, data?: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data ?? { success: false, message };
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const message =
      data?.message ??
      data?.error?.message ??
      (status === 0
        ? "ارتباط با سرور برقرار نشد."
        : "در انجام درخواست خطایی رخ داد.");

    return new ApiError(message, status, data);
  }

  if (error instanceof Error) return new ApiError(error.message, 0);
  return new ApiError("خطای ناشناخته‌ای رخ داده است.", 0);
}
