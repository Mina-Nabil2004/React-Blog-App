import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PenSquare, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  apiGetBlogsByAuthor,
  apiGetAllBlogs,
  apiDeleteBlog,
  apiPublishBlog,
  apiUnpublishBlog,
  apiApproveBlog,
} from '../../api/blogs';
import type { Blog } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import BlogGrid from '../../components/blog/BlogGrid';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';
import { resolveImageUrl } from '../../utils/imageUrl';
import { Link as RouterLink } from 'react-router-dom';

type Filter = 'all' | 'published' | 'draft' | 'pending';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
  { key: 'pending', label: 'Pending Approval' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Admin: all system blogs pending approval
  const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard — BlogApp';
    if (!user) return;

    // Fetch author's own blogs
    apiGetBlogsByAuthor(user.userID)
      .then((data) => setBlogs(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load your blogs'))
      .finally(() => setLoading(false));

    // Fetch all pending approval blogs for admin
    if (isAdmin) {
      setPendingLoading(true);
      apiGetAllBlogs()
        .then((data) => {
          const all = Array.isArray(data) ? data : [];
          setPendingBlogs(all.filter((b) => b.published && !b.approved));
        })
        .catch(() => toast.error('Failed to load pending blogs'))
        .finally(() => setPendingLoading(false));
    }
  }, [user, isAdmin]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'published': return blogs.filter((b) => b.published && b.approved);
      case 'draft':     return blogs.filter((b) => !b.published);
      case 'pending':   return blogs.filter((b) => b.published && !b.approved);
      default:          return blogs;
    }
  }, [blogs, filter]);

  const counts = useMemo(() => ({
    all: blogs.length,
    published: blogs.filter((b) => b.published && b.approved).length,
    draft: blogs.filter((b) => !b.published).length,
    pending: blogs.filter((b) => b.published && !b.approved).length,
  }), [blogs]);

  const handleDelete = async () => {
    if (!blogToDelete) return;
    setDeleting(true);
    try {
      await apiDeleteBlog(blogToDelete.blogID);
      setBlogs((prev) => prev.filter((b) => b.blogID !== blogToDelete.blogID));
      toast.success('Blog deleted');
    } catch {
      toast.error('Failed to delete blog');
    } finally {
      setDeleting(false);
      setBlogToDelete(null);
    }
  };

  const handlePublish = async (blog: Blog) => {
    try {
      const updated = await apiPublishBlog(blog.blogID);
      setBlogs((prev) => prev.map((b) => (b.blogID === updated.blogID ? updated : b)));
      toast.success('Blog published — awaiting approval');
    } catch {
      toast.error('Failed to publish blog');
    }
  };

  const handleUnpublish = async (blog: Blog) => {
    try {
      const updated = await apiUnpublishBlog(blog.blogID);
      setBlogs((prev) => prev.map((b) => (b.blogID === updated.blogID ? updated : b)));
      toast.success('Blog moved back to draft');
    } catch {
      toast.error('Failed to unpublish blog');
    }
  };

  const handleApprove = async (blog: Blog) => {
    try {
      const updated = await apiApproveBlog(blog.blogID);
      // Remove from pending list
      setPendingBlogs((prev) => prev.filter((b) => b.blogID !== updated.blogID));
      // Update own blogs list if it's there
      setBlogs((prev) => prev.map((b) => (b.blogID === updated.blogID ? updated : b)));
      toast.success('Blog approved and live!');
    } catch {
      toast.error('Failed to approve blog');
    }
  };

  if (loading) return <LoadingSpinner size="lg" fullPage />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

      {/* ── Admin Approval Section ─────────────────────────────────── */}
      {isAdmin && (
        <div className="mb-10">
          {/* Collapsible header */}
          <button
            onClick={() => setPendingOpen((o) => !o)}
            className="mb-4 flex w-full items-center gap-2 text-left"
          >
            <ShieldCheck size={18} className="text-primary-600 shrink-0" />
            <h2 className="text-lg font-bold text-content-primary">Pending Approval</h2>
            {pendingBlogs.length > 0 && (
              <span className="rounded-full bg-warning-500/10 px-2.5 py-0.5 text-xs font-semibold text-warning-500">
                {pendingBlogs.length} waiting
              </span>
            )}
            <span className="ml-auto text-content-tertiary">
              {pendingOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {pendingOpen && (
            pendingLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : pendingBlogs.length === 0 ? (
              <div className="rounded-2xl border border-surface-border bg-white px-6 py-8 text-center">
                <p className="text-sm text-content-secondary">All caught up — no blogs waiting for approval.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingBlogs.map((blog) => (
                  <div
                    key={blog.blogID}
                    className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-white p-4 hover:shadow-sm transition-shadow sm:flex-row sm:items-center"
                  >
                    {/* Top row: thumbnail + info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                        {resolveImageUrl(blog.imageUrl) ? (
                          <img
                            src={resolveImageUrl(blog.imageUrl)!}
                            alt={blog.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary-200">
                            {blog.title.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <RouterLink
                          to={`/blogs/${blog.blogID}`}
                          className="block truncate text-sm font-semibold text-content-primary hover:text-primary-600 transition-colors"
                        >
                          {blog.title}
                        </RouterLink>
                        <p className="mt-0.5 text-xs text-content-tertiary">
                          by <span className="font-medium text-content-secondary">{blog.author.name}</span>
                          {' · '}{formatDate(blog.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Approve button — full width on mobile, auto on desktop */}
                    <button
                      onClick={() => handleApprove(blog)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors sm:w-auto sm:shrink-0"
                    >
                      <ShieldCheck size={14} /> Approve
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          <hr className="mt-8 border-surface-border" />
        </div>
      )}

      {/* ── My Blogs Header ────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">My Blogs</h1>
          <p className="mt-1 text-sm text-content-secondary">
            Manage and track all your blog posts
          </p>
        </div>
        <Link
          to="/blogs/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          <PenSquare size={15} /> New Blog
        </Link>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-52 shrink-0">
          <nav className="flex flex-row gap-1 lg:flex-col overflow-x-auto">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === key
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-content-secondary hover:bg-surface-muted'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    filter === key
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-surface-border text-content-tertiary'
                  }`}
                >
                  {counts[key]}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Blog grid */}
        <div className="flex-1 min-w-0">
          <BlogGrid
            blogs={filtered}
            showActions
            emptyTitle={
              filter === 'all' ? "You haven't written anything yet" : `No ${filter} blogs`
            }
            emptyDescription={
              filter === 'all'
                ? 'Start writing and share your ideas with the world.'
                : undefined
            }
            emptyAction={
              filter === 'all' ? (
                <Link
                  to="/blogs/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                >
                  <PenSquare size={15} /> Write your first blog
                </Link>
              ) : undefined
            }
            onDelete={setBlogToDelete}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onApprove={handleApprove}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={!!blogToDelete}
        title="Delete blog?"
        message={`"${blogToDelete?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setBlogToDelete(null)}
      />
    </div>
  );
}
