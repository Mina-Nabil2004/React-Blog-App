import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { PenSquare, LogOut, User, LayoutDashboard, BookOpen, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-primary-600' : 'text-content-secondary hover:text-content-primary'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/blogs" className="flex items-center gap-2 text-primary-600 font-bold text-lg">
            <BookOpen size={22} />
            <span>BlogApp</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/blogs" className={navLinkClass}>
              Explore
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/blogs/new"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                >
                  <PenSquare size={15} />
                  Write
                </Link>
                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((p) => !p)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-content-secondary hover:bg-surface-muted transition-colors"
                  >
                    <Avatar name={user?.name ?? ''} avatarUrl={user?.avatarUrl} size="xs" />
                    <span className="font-medium text-content-primary">{user?.name}</span>
                  </button>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-surface-border bg-white py-1 shadow-lg">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-content-secondary hover:bg-surface-muted"
                        >
                          <User size={14} /> Profile
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-content-secondary hover:bg-surface-muted"
                        >
                          <LayoutDashboard size={14} /> Dashboard
                        </Link>
                        <hr className="my-1 border-surface-border" />
                        <button
                          onClick={() => { setDropdownOpen(false); logout(); }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger-500 hover:bg-surface-muted"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-content-secondary hover:text-content-primary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-content-secondary"
            onClick={() => setMenuOpen((p) => !p)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-surface-border bg-white px-4 py-4 flex flex-col gap-3">
          <NavLink to="/blogs" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            Explore
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>
          )}
          {isAuthenticated ? (
            <>
              <Link
                to="/blogs/new"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-primary-600"
              >
                Write a Blog
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-content-secondary"
              >
                Profile
              </Link>
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="text-left text-sm font-medium text-danger-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-content-secondary">
                Log in
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-primary-600">
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
