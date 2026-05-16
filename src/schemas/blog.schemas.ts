import { z } from 'zod';

export const createBlogSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(5, 'Content must be at least 5 characters'),
  published: z.boolean().optional(),
});

export const updateBlogSchema = createBlogSchema.partial();

export type CreateBlogFormData = z.infer<typeof createBlogSchema>;
export type UpdateBlogFormData = z.infer<typeof updateBlogSchema>;
