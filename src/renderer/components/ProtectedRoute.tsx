import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { checkFeature } from '../hooks/useFeature';
import { canAccessModule } from '../hooks/usePermission';

const ROLE_HIERARCHY: Record<string, number> = {
  MD: 100,
  admin: 100,
  Director: 80,
  Manager: 60,
  Accountant: 40,
  'Sales Rep': 30,
  member: 30,
  Staff: 10,
  viewer: 5,
};

function hasMinRole(userRole: string, minRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
}

interface ProtectedRouteProps {
  minRole?: string;
  module?: string;
  feature?: string;
}

export function ProtectedRoute({ minRole, module: mod, feature }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const user = useAuthStore((s) => s.user);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (minRole && !hasMinRole(user?.role ?? 'Staff', minRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (mod && !canAccessModule(mod)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (feature && !checkFeature(feature)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}