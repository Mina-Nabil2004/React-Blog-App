import { api } from './axios';
import type { Blog } from '../types';

export const apiGetPublishedBlogs = () =>
  api.get<Blog[]>('/blogs/published').then((r) => r.data);

export const apiGetAllBlogs = () =>
  api.get<Blog[]>('/blogs').then((r) => r.data);

export const apiGetBlogById = (id: string) =>
  api.get<Blog>(`/blogs/${id}`).then((r) => r.data);

export const apiGetBlogsByAuthor = (authorId: string) =>
  api.get<Blog[]>(`/blogs/author/${authorId}`).then((r) => r.data);

export const apiCreateBlog = (formData: FormData) =>
  api.post<Blog>('/blogs', formData).then((r) => r.data);

export const apiUpdateBlog = (id: string, formData: FormData) =>
  api.patch<Blog>(`/blogs/${id}`, formData).then((r) => r.data);

export const apiDeleteBlog = (id: string) =>
  api.delete(`/blogs/${id}`);

export const apiPublishBlog = (id: string) =>
  api.patch<Blog>(`/blogs/${id}/publish`).then((r) => r.data);

export const apiUnpublishBlog = (id: string) =>
  api.patch<Blog>(`/blogs/${id}/unpublish`).then((r) => r.data);

export const apiApproveBlog = (id: string) =>
  api.patch<Blog>(`/blogs/${id}/approve`).then((r) => r.data);

export const apiAddTag = (blogId: string, tagId: string) =>
  api.post<Blog>(`/blogs/${blogId}/tags/${tagId}`).then((r) => r.data);

export const apiRemoveTag = (blogId: string, tagId: string) =>
  api.delete(`/blogs/${blogId}/tags/${tagId}`);
