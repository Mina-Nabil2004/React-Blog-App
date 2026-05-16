import { z } from 'zod';

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Max 1000 characters'),
});

export type CommentFormData = z.infer<typeof commentSchema>;
