import { useAuthStore } from '../store/auth.store';

const MODULE_DEFAULT_ROLE: Record<string, string> = {
  dashboard: 'Staff', pos: 'Sales Rep', products: 'Staff', inventory: 'Staff',
  customers: 'Sales Rep', sales: 'Sales Rep', invoices: 'Accountant',
  vendors: 'Accountant', procurement: 'Manager', production: 'Manager',
  expenses: 'Accountant', accounting: 'Accountant', analytics: 'Accountant',
  reports: 'Accountant', approvals: 'Accountant', support: 'Staff',
  hr: 'Staff', fixed_assets: 'Director', multi_currency: 'Director',
};

const ROLE_HIERARCHY: Record<string, number> = {
  MD: 100, admin: 60, Director: 80, Manager: 60,
  Accountant: 40, 'Sales Rep': 30, member: 30, Staff: 10, viewer: 5,
};

function hasMinRole(userRole: string, minRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
}

export function canAccessModule(module: string): boolean {
  const { user, permissions } = useAuthStore.getState();
  if (!user) return false;
  // If permissions are configured, use them
  if (permissions && permissions.length > 0) {
    return permissions.includes(module);
  }
  // Fall back to role hierarchy
  const requiredRole = MODULE_DEFAULT_ROLE[module] || 'Staff';
  return hasMinRole(user.role, requiredRole);
}

export function usePermission() {
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);

  const canAccess = (module: string): boolean => {
    if (!user) return false;
    if (permissions && permissions.length > 0) {
      return permissions.includes(module);
    }
    const requiredRole = MODULE_DEFAULT_ROLE[module] || 'Staff';
    return hasMinRole(user.role, requiredRole);
  };

  return { canAccess, permissions };
}
