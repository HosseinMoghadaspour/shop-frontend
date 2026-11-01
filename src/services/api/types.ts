export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
  errors?: Record<string, string[] | string>;
}
