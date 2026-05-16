import { api } from './axios';
import type { Comment } from '../types';

export const apiGetBlogComments = (blogId: string) =>
  api.get<Comment[]>(`/blogs/${blogId}/comments`).then((r) => r.data);

export const apiCreateComment = (data: { content: string; blogID: string }) =>
  api.post<Comment>('/comments', data).then((r) => r.data);

export const apiUpdateComment = (id: string, content: string) =>
  api.patch<Comment>(`/comments/${id}`, { content }).then((r) => r.data);

export const apiDeleteComment = (id: string) =>
  api.delete(`/comments/${id}`);
