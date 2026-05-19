import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { Comment } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { formatRelative } from '../../utils/formatDate';
import { apiUpdateComment, apiDeleteComment } from '../../api/comments';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

interface Props {
  comment: Comment;
  onUpdated: (c: Comment) => void;
  onDeleted: (id: string) => void;
}

export default function CommentItem({ comment, onUpdated, onDeleted }: Props) {
  const { user } = useAuth();
  const isOwner = user?.userID === comment.author.userID;
  const isAdmin = user?.role === 'ADMIN';
  const canDelete = isOwner || isAdmin;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    try {
      const updated = await apiUpdateComment(comment.commentID, value.trim());
      onUpdated(updated);
      setEditing(false);
    } catch {
      toast.error('Failed to update comment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiDeleteComment(comment.commentID);
      onDeleted(comment.commentID);
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar name={comment.author.name} avatarUrl={comment.author.avatarUrl} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-content-primary">{comment.author.name}</span>
          <span className="text-xs text-content-tertiary">{formatRelative(comment.createdAt)}</span>
        </div>

        {editing ? (
          <div className="mt-1.5 flex flex-col gap-2">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-1 text-xs font-medium text-white hover:bg-primary-600 disabled:opacity-60"
              >
                <Check size={12} /> Save
              </button>
              <button
                onClick={() => { setEditing(false); setValue(comment.content); }}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-3 py-1 text-xs font-medium text-content-secondary hover:bg-surface-border"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-content-secondary leading-relaxed break-words overflow-hidden">{comment.content}</p>
        )}

        {(isOwner || canDelete) && !editing && (
          <div className="mt-1.5 flex gap-3">
            {isOwner && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-content-tertiary hover:text-primary-600 transition-colors"
              >
                <Pencil size={11} /> Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 text-xs text-content-tertiary hover:text-danger-500 transition-colors disabled:opacity-60"
              >
                <Trash2 size={11} /> {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
