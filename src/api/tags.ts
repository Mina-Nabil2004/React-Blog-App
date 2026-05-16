import { api } from './axios';
import type { Tag } from '../types';

export const apiGetTags = () =>
  api.get<Tag[]>('/tags').then((r) => r.data);

export const apiCreateTag = (name: string) =>
  api.post<Tag>('/tags', { name }).then((r) => r.data);
