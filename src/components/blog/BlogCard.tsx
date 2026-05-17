import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import type { Blog } from '../../types';
import { resolveImageUrl } from '../../utils/imageUrl';
import { formatDate } from '../../utils/formatDate';
import BlogStatusBadge from './BlogStatusBadge';
import TagBadge from './TagBadge';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  blog: Blog;
  showActions?: boolean;
  onDelete?: (blog: Blog) => void;
  onPublish?: (blog: Blog) => void;
  onUnpublish?: (blog: Blog) => void;
  onApprove?: (blog: Blog) => void;
}

export default function BlogCard({
  blog,
  showActions,
  onDelete,
  onPublish,
  onUnpublish,
  onApprove,
}: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const imageUrl = resolveImageUrl(blog.imageUrl);

  const goToBlog = () => navigate(`/blogs/${blog.blogID}`);

  const stopAndNavigate = (e: React.MouseEvent, to: string) => {
    e.stopPropagation();
    navigate(to);
  };

  return (
    <div
      onClick={goToBlog}
      className="group flex flex-col rounded-2xl bg-white border border-surface-border shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
    >
      {/* Cover image */}
      <div className="aspect-video w-full overflow-hidden bg-surface-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={blog.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <span className="text-4xl font-bold text-primary-200">
              {blog.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Status + tags */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {showActions && <BlogStatusBadge published={blog.published} approved={blog.approved} />}
          {(blog.tags ?? []).slice(0, 2).map((t) => (
            <TagBadge key={t.tagID} name={t.name} />
          ))}
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-base font-semibold text-content-primary group-hover:text-primary-600 transition-colors">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="mb-4 line-clamp-3 flex-1 text-sm text-content-secondary leading-relaxed">
          {blog.content}
        </p>

        {/* Author + date */}
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => stopAndNavigate(e, `/users/${blog.author.userID}`)}
            className="flex items-center gap-2 group/author"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600">
              {blog.author.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-content-secondary group-hover/author:text-primary-600 transition-colors">
              {blog.author.name}
            </span>
          </button>
          <span className="text-xs text-content-tertiary">{formatDate(blog.createdAt)}</span>
        </div>

        {/* Dashboard actions */}
        {showActions && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 flex flex-wrap items-center gap-2 border-t border-surface-border pt-4"
          >
            <Link
              to={`/blogs/${blog.blogID}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-medium text-content-secondary hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <Pencil size={12} /> Edit
            </Link>

            {blog.published ? (
              <button
                onClick={() => onUnpublish?.(blog)}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-medium text-content-secondary hover:bg-warning-500/10 hover:text-warning-500 transition-colors"
              >
                <EyeOff size={12} /> Unpublish
              </button>
            ) : (
              <button
                onClick={() => onPublish?.(blog)}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-medium text-content-secondary hover:bg-success-500/10 hover:text-success-500 transition-colors"
              >
                <Eye size={12} /> Publish
              </button>
            )}

            {user?.role === 'ADMIN' && blog.published && !blog.approved && (
              <button
                onClick={() => onApprove?.(blog)}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-medium text-content-secondary hover:bg-success-500/10 hover:text-success-500 transition-colors"
              >
                <CheckCircle size={12} /> Approve
              </button>
            )}

            <button
              onClick={() => onDelete?.(blog)}
              className="ml-auto inline-flex items-center gap-1 rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-medium text-content-secondary hover:bg-danger-500/10 hover:text-danger-500 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
