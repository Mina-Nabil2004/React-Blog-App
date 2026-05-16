import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiLogin, apiLogout, apiSignup } from '../api/auth';
import type { UserPublic } from '../types';

interface AuthContextValue {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserPublic) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtPayload(token: string): { exp: number } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Bootstrap: restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('blog_access_token');
    const raw = localStorage.getItem('blog_user');
    if (token && raw) {
      const payload = decodeJwtPayload(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        try {
          setUser(JSON.parse(raw));
        } catch {
          localStorage.clear();
        }
      } else {
        localStorage.removeItem('blog_access_token');
        localStorage.removeItem('blog_refresh_token');
        localStorage.removeItem('blog_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Listen for forced logout from axios interceptor
  useEffect(() => {
    const handler = () => {
      setUser(null);
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [navigate]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin({ email, password });
    localStorage.setItem('blog_access_token', data.accessToken);
    localStorage.setItem('blog_refresh_token', data.refreshToken);
    localStorage.setItem('blog_user', JSON.stringify(data.user));
    setUser(data.user);
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await apiSignup({ name, email, password });
    // Auto-login after signup
    const data = await apiLogin({ email, password });
    localStorage.setItem('blog_access_token', data.accessToken);
    localStorage.setItem('blog_refresh_token', data.refreshToken);
    localStorage.setItem('blog_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Welcome to BlogApp!');
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('blog_refresh_token');
    if (refreshToken) {
      try {
        await apiLogout(refreshToken);
      } catch {
        // ignore errors — clear local state regardless
      }
    }
    localStorage.removeItem('blog_access_token');
    localStorage.removeItem('blog_refresh_token');
    localStorage.removeItem('blog_user');
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const updateUser = useCallback((updated: UserPublic) => {
    setUser(updated);
    localStorage.setItem('blog_user', JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
