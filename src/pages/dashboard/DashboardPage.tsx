import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PenSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  apiGetBlogsByAuthor,
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

type Filter = 'all' | 'published' | 'draft' | 'pending';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
  { key: 'pending', label: 'Pending Approval' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard — BlogApp';
    if (!user) return;
    apiGetBlogsByAuthor(user.userID)
      .then((data) => setBlogs(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load your blogs'))
      .finally(() => setLoading(false));
  }, [user]);

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
      setBlogs((prev) => prev.map((b) => (b.blogID === updated.blogID ? updated : b)));
      toast.success('Blog approved');
    } catch {
      toast.error('Failed to approve blog');
    }
  };

  if (loading) return <LoadingSpinner size="lg" fullPage />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
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
