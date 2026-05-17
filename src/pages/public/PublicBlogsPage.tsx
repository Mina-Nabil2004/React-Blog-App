import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PenSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiGetPublishedBlogs } from '../../api/blogs';
import type { Blog } from '../../types';
import BlogGrid from '../../components/blog/BlogGrid';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

export default function PublicBlogsPage() {
  const { isAuthenticated } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Explore Blogs — BlogApp';
    apiGetPublishedBlogs()
      .then((data) => setBlogs(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load blogs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.name.toLowerCase().includes(search.toLowerCase()) ||
      b.tags.some((t) => t.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-content-primary sm:text-5xl">
          Explore Stories
        </h1>
        <p className="mt-3 text-lg text-content-secondary">
          Discover ideas, insights, and perspectives from our community.
        </p>
        {isAuthenticated && (
          <Link
            to="/blogs/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            <PenSquare size={16} /> Write a Blog
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="mb-8 relative max-w-md mx-auto">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary"
        />
        <input
          type="text"
          placeholder="Search by title, author, or tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-surface-border bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Results count */}
      {!loading && search && (
        <p className="mb-6 text-sm text-content-secondary">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &quot;{search}&quot;
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <BlogGrid
          blogs={filtered}
          emptyTitle={search ? 'No blogs match your search' : 'No blogs published yet'}
          emptyDescription={
            search
              ? 'Try a different keyword or browse all blogs.'
              : 'Check back soon for new content.'
          }
        />
      )}
    </div>
  );
}
