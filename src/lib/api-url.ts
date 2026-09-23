const API_URL = import.meta.env.VITE_API_URL;

export function getApiAssetUrl(path: string): string {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_URL}${path}`;
}
