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

/**
 * Returns a readable API error message while preserving a feature-specific fallback.
 * Keep this helper free of UI side effects; the API client owns global notifications.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
            error?: { message?: string };
          };
        };
      }
    ).response;

    if (response?.data?.message) return response.data.message;
    if (response?.data?.error?.message) return response.data.error.message;
  }

  return error instanceof Error ? error.message : fallback;
}
