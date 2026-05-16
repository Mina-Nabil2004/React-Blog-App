import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import GuestRoute from './components/auth/GuestRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Placeholder pages — will be replaced in later branches
function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-content-secondary">{label} — coming soon</p>
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
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

            {/* Public */}
            <Route path="/blogs" element={<ComingSoon label="Public blogs" />} />
            <Route path="/blogs/:id" element={<ComingSoon label="Blog detail" />} />

            {/* Protected */}
            <Route path="/blogs/new" element={<ProtectedRoute><ComingSoon label="Create blog" /></ProtectedRoute>} />
            <Route path="/blogs/:id/edit" element={<ProtectedRoute><ComingSoon label="Edit blog" /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><ComingSoon label="Dashboard" /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ComingSoon label="Profile" /></ProtectedRoute>} />

            <Route path="*" element={<ComingSoon label="404 — Page not found" />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
