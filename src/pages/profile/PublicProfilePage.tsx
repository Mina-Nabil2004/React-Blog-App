import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, PenSquare, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiGetUser } from '../../api/users';
import { apiGetBlogsByAuthor } from '../../api/blogs';
import type { UserPublic, Blog } from '../../types';
import { resolveImageUrl } from '../../utils/imageUrl';
import { formatDate } from '../../utils/formatDate';
import BlogGrid from '../../components/blog/BlogGrid';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<UserPublic | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([apiGetUser(id), apiGetBlogsByAuthor(id)])
      .then(([user, data]) => {
        setAuthor(user);
        document.title = `${user.name} — BlogApp`;
        const all = Array.isArray(data) ? data : [];
        setBlogs(
          all
            .filter((b) => b.published && b.approved === true)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" fullPage />;
  if (!author) return null;

  const avatarUrl = resolveImageUrl(author.avatarUrl);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to="/blogs"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary transition-colors"
      >
        <ArrowLeft size={15} /> Back to blogs
      </Link>

      {/* Profile header */}
      <div className="mb-10 flex flex-col items-center gap-5 rounded-2xl border border-surface-border bg-white px-8 py-10 text-center shadow-sm sm:flex-row sm:text-left">
        {/* Avatar */}
        <div className="shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={author.name}
              className="h-24 w-24 rounded-full object-cover border-4 border-surface-border"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-600 border-4 border-surface-border">
              {author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl font-extrabold text-content-primary">{author.name}</h1>
            {author.role === 'ADMIN' && (
              <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-600">
                Admin
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-content-secondary">{author.email}</p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-content-tertiary sm:justify-start">
            <Calendar size={12} />
            Member since {formatDate(author.createdAt)}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-content-secondary sm:justify-start">
            <PenSquare size={12} />
            {blogs.length} published {blogs.length === 1 ? 'story' : 'stories'}
          </div>
        </div>
      </div>

      {/* Blog grid */}
      <h2 className="mb-6 text-lg font-bold text-content-primary">Stories by {author.name}</h2>
      <BlogGrid
        blogs={blogs}
        emptyTitle="No published stories yet"
        emptyDescription="This author hasn't published any stories yet."
      />
    </div>
  );
}
