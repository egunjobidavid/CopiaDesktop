import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useFeature } from '../hooks/useFeature';
import { canAccessModule } from '../hooks/usePermission';
import api from '../api/client';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  FileText,
  Receipt,
  ShoppingBag,
  ClipboardList,
  Factory,
  Wallet,
  BarChart3,
  Settings,
  LifeBuoy,
  LogOut,
  CheckSquare,
  CreditCard,
  Shield,
  Building2,
  MapPin,
  UserCog,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
} from 'lucide-react';

type NavItem = {
  path: string;
  label: string;
  icon: any;
  minRole: string;
  module?: string;
  feature?: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: '',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, minRole: 'Staff' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { path: '/pos', label: 'Point of Sale', icon: ShoppingCart, minRole: 'Sales Rep' },
      { path: '/products', label: 'Products', icon: Package, minRole: 'Staff' },
      { path: '/inventory', label: 'Inventory', icon: Warehouse, minRole: 'Staff' },
      { path: '/customers', label: 'Customers', icon: Users, minRole: 'Sales Rep' },
      { path: '/sales', label: 'Sales Orders', icon: FileText, minRole: 'Sales Rep' },
      { path: '/invoices', label: 'Invoices', icon: Receipt, minRole: 'Accountant' },
    ],
  },
  {
    label: 'Procurement',
    items: [
      { path: '/vendors', label: 'Vendors', icon: ShoppingBag, minRole: 'Accountant' },
      { path: '/procurement', label: 'Purchase Orders', icon: ClipboardList, minRole: 'Manager' },
    ],
  },
  {
    label: 'Production',
    items: [
      { path: '/production', label: 'Production', icon: Factory, minRole: 'Manager' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { path: '/expenses', label: 'Expenses', icon: Wallet, minRole: 'Accountant' },
      { path: '/approvals', label: 'Approvals', icon: CheckSquare, minRole: 'Accountant', feature: 'approvals' },
      { path: '/reports', label: 'Reports', icon: BarChart3, minRole: 'Accountant' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { path: '/settings', label: 'General', icon: Settings, minRole: 'Manager' },
      { path: '/settings/roles', label: 'Roles', icon: Shield, minRole: 'Staff', module: 'hr' },
      { path: '/settings/departments', label: 'Departments', icon: Building2, minRole: 'Staff', module: 'hr' },
      { path: '/settings/locations', label: 'Locations', icon: MapPin, minRole: 'Staff', module: 'hr', feature: 'locations' },
      { path: '/settings/staff', label: 'Staff', icon: UserCog, minRole: 'Staff', module: 'hr' },
      { path: '/settings/audit', label: 'Staff Audit', icon: ClipboardCheck, minRole: 'Staff', module: 'hr' },
      { path: '/settings/billing', label: 'Billing', icon: CreditCard, minRole: 'Manager' },
      { path: '/settings/support', label: 'Support', icon: LifeBuoy, minRole: 'Staff' },
    ],
  },
];

const ROLE_HIERARCHY: Record<string, number> = {
  MD: 100,
  admin: 60,
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

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { hasFeature } = useFeature();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const userRole = user?.role ?? 'Staff';

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <aside className="flex flex-col w-60 bg-gray-900 text-gray-300">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="font-semibold text-lg text-white">CopiaOS</span>
      </div>

      {/* User info */}
      <div className="px-5 py-3 border-b border-gray-800">
        <p className="text-sm font-medium text-white truncate">
          {user?.fullName || 'User'}
        </p>
        <p className="text-xs text-gray-400 truncate">{user?.role || 'Staff'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) =>
              hasMinRole(userRole, item.minRole) &&
              (!item.module || canAccessModule(item.module)) &&
              (!item.feature || hasFeature(item.feature)),
          );

          if (visibleItems.length === 0) return null;

          const isCollapsed = collapsedSections.has(section.label);

          return (
            <div key={section.label || 'root'}>
              {/* Section header */}
              {section.label && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-400 transition-colors"
                >
                  <span>{section.label}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}

              {/* Items */}
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    const isSubItem = section.label === 'Settings' && item.path !== '/settings';

                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        } ${isSubItem ? 'pl-9' : ''}`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
