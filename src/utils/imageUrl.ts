const BASE = import.meta.env.VITE_API_BASE_URL as string;

export function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE}${path}`;
}
