
import axios from "axios";

console.log("API URL:", import.meta.env.VITE_API_URL);

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export function isUnauthorizedError(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 401
  );
}
