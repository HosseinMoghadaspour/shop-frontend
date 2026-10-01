import axios from "axios";

console.log("API URL:", import.meta.env.VITE_API_URL);

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export function isUnauthorizedError(error: unknown): boolean {
    return(
        axios.isAxiosError(error) &&
        error .response?.status === 401
    );
}
