import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiGetBlogById, apiDeleteBlog } from '../../api/blogs';
import type { Blog } from '../../types';
import { resolveImageUrl } from '../../utils/imageUrl';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';
import TagBadge from '../../components/blog/TagBadge';
import CommentList from '../../components/comments/CommentList';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGetBlogById(id)
      .then((b) => {
        setBlog(b);
        document.title = `${b.title} — BlogApp`;
      })
      .catch(() => {
        toast.error('Blog not found');
        navigate('/blogs', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!blog) return;
    setDeleting(true);
    try {
      await apiDeleteBlog(blog.blogID);
      toast.success('Blog deleted');
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('Failed to delete blog');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" fullPage />;
  if (!blog) return null;

  const isAuthor = user?.userID === blog.author.userID;
  const imageUrl = resolveImageUrl(blog.imageUrl);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        to="/blogs"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary transition-colors"
      >
        <ArrowLeft size={15} /> Back to blogs
      </Link>

      {/* Cover */}
      {imageUrl && (
        <div className="mb-8 overflow-hidden rounded-2xl">
          <img src={imageUrl} alt={blog.title} className="aspect-video w-full object-cover" />
        </div>
      )}

      {/* Tags */}
      {blog.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {blog.tags.map((t) => <TagBadge key={t.tagID} name={t.name} />)}
        </div>
      )}

      {/* Title */}
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-content-primary sm:text-4xl">
        {blog.title}
      </h1>

      {/* Meta */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
            {blog.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-content-primary">
              <User size={13} /> {blog.author.name}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-content-tertiary">
              <Calendar size={11} /> {formatDate(blog.createdAt)}
            </div>
          </div>
        </div>

        {/* Author actions */}
        {isAuthor && (
          <div className="flex items-center gap-2">
            <Link
              to={`/blogs/${blog.blogID}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-surface-border bg-white px-3 py-1.5 text-sm font-medium text-content-secondary hover:bg-surface-muted transition-colors"
            >
              <Pencil size={13} /> Edit
            </Link>
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-danger-500/30 bg-white px-3 py-1.5 text-sm font-medium text-danger-500 hover:bg-danger-500/5 transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Content — visible to everyone */}
      <div className="font-serif text-lg leading-8 text-content-primary whitespace-pre-wrap">
        {blog.content}
      </div>

      {/* Comments — gated for guests inside CommentList */}
      <CommentList blogId={blog.blogID} />

      <ConfirmModal
        isOpen={confirmDelete}
        title="Delete blog?"
        message="This action cannot be undone. The blog and all its comments will be permanently deleted."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
