import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach access token ────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('blog_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: silent token refresh on 401 ───────────────────────────────────
let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  subscribers.push(cb);
}

function notifySubscribers(token: string) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('blog_refresh_token');
    if (!refreshToken) {
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // Use a plain axios call to avoid interceptor loop
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      localStorage.setItem('blog_access_token', data.accessToken);
      localStorage.setItem('blog_refresh_token', data.refreshToken);
      api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      notifySubscribers(data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch {
      localStorage.removeItem('blog_access_token');
      localStorage.removeItem('blog_refresh_token');
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
