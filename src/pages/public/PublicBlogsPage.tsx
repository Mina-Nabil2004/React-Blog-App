import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, PenSquare, Lock, LogIn } from 'lucide-react';
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
  const [showSearchGate, setShowSearchGate] = useState(false);
  const gateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Explore Blogs — BlogApp';
    apiGetPublishedBlogs()
      .then((data) => setBlogs((Array.isArray(data) ? data : []).filter((b) => b.approved === true)))
      .catch(() => toast.error('Failed to load blogs'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showSearchGate) return;
    const handler = (e: MouseEvent) => {
      if (gateRef.current && !gateRef.current.contains(e.target as Node)) {
        setShowSearchGate(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSearchGate]);

  const filtered = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.tags ?? []).some((t) => t.name.toLowerCase().includes(search.toLowerCase())),
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
      <div className="mb-8 relative max-w-md mx-auto" ref={gateRef}>
        {isAuthenticated ? (
          <>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <input
              type="text"
              placeholder="Search by title, author, or tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </>
        ) : (
          <>
            <button
              onClick={() => setShowSearchGate(true)}
              className="w-full flex items-center gap-2 rounded-xl border border-surface-border bg-surface-muted py-2.5 pl-3 pr-4 text-sm text-content-tertiary cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
            >
              <Search size={16} className="text-content-tertiary" />
              <span className="flex-1 text-left">Search by title, author, or tag…</span>
              <Lock size={14} className="text-content-tertiary" />
            </button>

            {showSearchGate && (
              <div className="absolute top-full left-0 right-0 mt-2 z-10 rounded-2xl border border-surface-border bg-white shadow-lg p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                  <Search size={18} className="text-primary-500" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-content-primary">Sign in to search</h3>
                <p className="mb-4 text-xs text-content-secondary leading-relaxed">
                  Search across all stories by title, author, or tag — create a free account to get started.
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-500 px-3 py-2 text-xs font-medium text-white hover:bg-primary-600 transition-colors"
                  >
                    <LogIn size={13} /> Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 inline-flex items-center justify-center rounded-xl border border-surface-border px-3 py-2 text-xs font-medium text-content-secondary hover:bg-surface-muted transition-colors"
                  >
                    Sign up free
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Results count */}
      {!loading && search && isAuthenticated && (
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
