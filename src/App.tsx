import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import GuestRoute from './components/auth/GuestRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Public
import PublicBlogsPage from './pages/public/PublicBlogsPage';
import BlogDetailPage from './pages/blogs/BlogDetailPage';

// Protected
import DashboardPage from './pages/dashboard/DashboardPage';
import CreateBlogPage from './pages/blogs/CreateBlogPage';
import EditBlogPage from './pages/blogs/EditBlogPage';
import ProfilePage from './pages/profile/ProfilePage';

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <p className="text-6xl font-extrabold text-primary-200">404</p>
      <p className="text-lg font-semibold text-content-primary">Page not found</p>
      <a href="/blogs" className="text-sm text-primary-600 hover:underline">← Back to blogs</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/blogs" replace />} />

            {/* Guest-only */}
            <Route path="/login"  element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

            {/* Public */}
            <Route path="/blogs" element={<PublicBlogsPage />} />
            {/* /blogs/new must be before /blogs/:id */}
            <Route path="/blogs/new" element={<ProtectedRoute><CreateBlogPage /></ProtectedRoute>} />
            <Route path="/blogs/:id" element={<BlogDetailPage />} />
            <Route path="/blogs/:id/edit" element={<ProtectedRoute><EditBlogPage /></ProtectedRoute>} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
