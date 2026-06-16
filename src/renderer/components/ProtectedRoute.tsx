import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  console.log('[ProtectedRoute] isInitialized:', isInitialized, 'isAuthenticated:', isAuthenticated);

  if (!isInitialized) {
    console.log('[ProtectedRoute] showing spinner');
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] rendering protected content');
  return <Outlet />;
}
