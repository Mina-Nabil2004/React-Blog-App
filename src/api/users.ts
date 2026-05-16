import { api } from './axios';
import type { UserPublic } from '../types';

export const apiGetUser = (id: string) =>
  api.get<UserPublic>(`/users/${id}`).then((r) => r.data);

export const apiUpdateMe = (data: { name?: string; email?: string }) =>
  api.patch<UserPublic>('/users/me', data).then((r) => r.data);

export const apiUploadAvatar = (formData: FormData) =>
  api.post<UserPublic>('/users/me/avatar', formData).then((r) => r.data);

export const apiDeleteAvatar = () =>
  api.delete('/users/me/avatar');
