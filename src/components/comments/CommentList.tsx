import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Comment } from '../../types';
import { apiGetBlogComments, apiCreateComment } from '../../api/comments';
import { useAuth } from '../../hooks/useAuth';
import CommentItem from './CommentItem';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Props {
  blogId: string;
}

export default function CommentList({ blogId }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGetBlogComments(blogId)
      .then(setComments)
      .catch(() => toast.error('Failed to load comments'))
      .finally(() => setLoading(false));
  }, [blogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const created = await apiCreateComment({ content: newComment.trim(), blogID: blogId });
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-xl font-bold text-content-primary">
        Comments ({comments.length})
      </h2>

      {/* Add comment */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-1 items-end gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment…"
              rows={2}
              className="flex-1 rounded-xl border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? <LoadingSpinner size="sm" /> : <Send size={15} />}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-8 rounded-xl border border-surface-border bg-surface-muted px-4 py-3 text-sm text-content-secondary">
          <a href="/login" className="font-medium text-primary-600 hover:underline">Log in</a> to leave a comment.
        </p>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-content-tertiary">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {comments.map((c) => (
            <CommentItem
              key={c.commentID}
              comment={c}
              onUpdated={(updated) =>
                setComments((prev) => prev.map((x) => (x.commentID === updated.commentID ? updated : x)))
              }
              onDeleted={(id) =>
                setComments((prev) => prev.filter((x) => x.commentID !== id))
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
