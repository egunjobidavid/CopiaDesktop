import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useFeature } from '../hooks/useFeature';
import { canAccessModule } from '../hooks/usePermission';
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
  HelpCircle,
  FileSignature,
  Banknote,
} from 'lucide-react';
import logo from '../assets/logo.svg';

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
      { path: '/quotes', label: 'Quotes', icon: FileSignature, minRole: 'Sales Rep' },
      { path: '/invoices', label: 'Invoices', icon: Receipt, minRole: 'Accountant' },
    ],
  },
  {
    label: 'Procurement',
    items: [
      { path: '/vendors', label: 'Vendors', icon: ShoppingBag, minRole: 'Accountant' },
      { path: '/procurement', label: 'Purchase Orders', icon: ClipboardList, minRole: 'Manager' },
      { path: '/procurement/payments', label: 'Bill Payments', icon: Banknote, minRole: 'Manager' },
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
  {
    label: '',
    items: [
      { path: '/help', label: 'Help & Getting Started', icon: HelpCircle, minRole: 'Staff' },
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
    <aside className="flex flex-col w-60 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <img src={logo} alt="CopiaOS" className="w-8 h-8 rounded-lg" />
        <span className="font-bold text-lg text-gray-900 tracking-tight">CopiaOS</span>
      </div>

      {/* User info */}
      <div className="px-5 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {user?.fullName || 'User'}
        </p>
        <p className="text-xs text-gray-500 truncate">{user?.role || 'Staff'}</p>
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
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
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
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } ${isSubItem ? 'pl-9' : ''}`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
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
      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
