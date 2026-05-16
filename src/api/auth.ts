import { api } from './axios';
import type { LoginResponse, TokenResponse, UserPublic } from '../types';

export const apiSignup = (data: { name: string; email: string; password: string }) =>
  api.post<UserPublic>('/auth/signup', data).then((r) => r.data);

export const apiLogin = (data: { email: string; password: string }) =>
  api.post<LoginResponse>('/auth/login', data).then((r) => r.data);

export const apiRefresh = (refreshToken: string) =>
  api.post<TokenResponse>('/auth/refresh', { refreshToken }).then((r) => r.data);

export const apiLogout = (refreshToken: string) =>
  api.post('/auth/logout', { refreshToken });

export const apiChangePassword = (data: { currentPassword: string; newPassword: string }) =>
  api.post('/auth/change-password', data);
