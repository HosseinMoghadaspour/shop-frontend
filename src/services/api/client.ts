import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

type ApiPayload = {
  success?: boolean;
  message?: unknown;
  error?: { message?: unknown };
  errors?: Record<string, string | string[]>;
};

function readServerMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;

  const body = payload as ApiPayload;
  if (typeof body.message === "string" && body.message.trim()) {
    return body.message.trim();
  }
  if (typeof body.error?.message === "string" && body.error.message.trim()) {
    return body.error.message.trim();
  }

  if (body.errors) {
    const messages = Object.values(body.errors)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value): value is string => typeof value === "string" && value.trim());
    if (messages.length) return messages.join("، ");
  }

  return undefined;
}

function isExpectedAuthBootstrap(error: AxiosError): boolean {
  if (error.response?.status !== 401) return false;
  const url = error.config?.url ?? "";
  return /\/api\/auth\/(me|customer\/me|admin\/me)(?:\?|$)/i.test(url);
}

function showApiError(error: AxiosError) {
  if (isExpectedAuthBootstrap(error)) return;

  const message =
    readServerMessage(error.response?.data) ??
    (error.code === "ERR_NETWORK"
      ? "ارتباط با سرور برقرار نشد. اتصال اینترنت یا وضعیت سرور را بررسی کنید."
      : "در انجام درخواست خطایی رخ داد. لطفاً دوباره تلاش کنید.");

  const status = error.response?.status ?? "network";
  toast.error(message, {
    id: `api-error-${status}-${message}`,
    duration: 5000,
  });
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    const payload = response.data as ApiPayload | undefined;

    // Only user-triggered write operations show success notifications.
    // GET requests remain quiet to avoid a toast on every page load.
    if (
      method &&
      !["get", "head", "options"].includes(method) &&
      payload?.success === true
    ) {
      const message = readServerMessage(payload);
      if (message) toast.success(message, { duration: 3500 });
    }

    return response;
  },
  (error: AxiosError) => {
    showApiError(error);
    return Promise.reject(error);
  },
);

export function isUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
