import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

type NavItem = {
  path: string;
  label: string;
  icon: any;
  minRole: string;
  module?: string;
  feature?: string;
};

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, minRole: 'Staff' },
  { path: '/pos', label: 'Point of Sale', icon: ShoppingCart, minRole: 'Sales Rep' },
  { path: '/products', label: 'Products', icon: Package, minRole: 'Staff' },
  { path: '/inventory', label: 'Inventory', icon: Warehouse, minRole: 'Staff' },
  { path: '/customers', label: 'Customers', icon: Users, minRole: 'Sales Rep' },
  { path: '/sales', label: 'Sales Orders', icon: FileText, minRole: 'Sales Rep' },
  { path: '/invoices', label: 'Invoices', icon: Receipt, minRole: 'Accountant' },
  { path: '/vendors', label: 'Vendors', icon: ShoppingBag, minRole: 'Accountant' },
  { path: '/procurement', label: 'Procurement', icon: ClipboardList, minRole: 'Manager' },
  { path: '/production', label: 'Production', icon: Factory, minRole: 'Manager', feature: 'production' },
  { path: '/expenses', label: 'Expenses', icon: Wallet, minRole: 'Accountant' },
  { path: '/approvals', label: 'Approvals', icon: CheckSquare, minRole: 'Accountant', feature: 'approvals' },
  { path: '/reports', label: 'Reports', icon: BarChart3, minRole: 'Accountant' },
  { path: '/settings', label: 'Settings', icon: Settings, minRole: 'Manager' },
  { path: '/settings/roles', label: 'Roles', icon: Shield, minRole: 'Staff', module: 'hr' },
  { path: '/settings/departments', label: 'Departments', icon: Building2, minRole: 'Staff', module: 'hr' },
  { path: '/settings/locations', label: 'Locations', icon: MapPin, minRole: 'Staff', module: 'hr', feature: 'locations' },
  { path: '/settings/staff', label: 'Staff', icon: UserCog, minRole: 'Staff', module: 'hr' },
  { path: '/settings/billing', label: 'Billing', icon: CreditCard, minRole: 'Manager' },
  { path: '/settings/support', label: 'Support', icon: LifeBuoy, minRole: 'Staff' },
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

interface LocationOption {
  id: string;
  name: string;
  city: string | null;
  type: string | null;
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);
  const locationId = useAuthStore((s) => s.locationId);
  const locationName = useAuthStore((s) => s.locationName);
  const setLocation = useAuthStore((s) => s.setLocation);
  const { hasFeature } = useFeature();
  const [orgName, setOrgName] = useState('');
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [showLocDropdown, setShowLocDropdown] = useState(false);

  const userRole = user?.role ?? 'Staff';

  useEffect(() => {
    if (tenantId) {
      api.get('/auth/me').then(({ data }) => {
        if (data?.tenants?.length > 0) {
          const t = data.tenants.find((t: any) => t.id === tenantId);
          if (t) setOrgName(t.name);
        }
      }).catch(() => {});
    }
  }, [tenantId]);

  useEffect(() => {
    api.get('/locations').then(({ data }) => {
      setLocations(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const visibleItems = navItems.filter(
    (item) => hasMinRole(userRole, item.minRole) && (!item.module || canAccessModule(item.module)) && (!item.feature || hasFeature(item.feature)),
  );

  return (
    <aside className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="font-semibold text-lg text-gray-900">CopiaOS</span>
      </div>

      {/* User info + Org + Location */}
      <div className="px-6 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user?.fullName || 'User'}
        </p>
        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
        {user?.role && (
          <p className="text-xs text-blue-600 font-medium truncate mt-1">{user.role}</p>
        )}
        {orgName && (
          <p className="text-xs text-purple-600 font-medium truncate">{orgName}</p>
        )}
        {/* Location Selector */}
        {locations.length > 0 && (
          <div className="relative mt-2">
            <button
              onClick={() => setShowLocDropdown(!showLocDropdown)}
              className="w-full flex items-center gap-2 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 transition-colors"
            >
              <MapPin className="w-3 h-3 text-green-600 flex-shrink-0" />
              <span className="text-gray-700 truncate flex-1 text-left">{locationName || 'All Locations'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
            </button>
            {showLocDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                <button
                  onClick={() => { setLocation(null, null); setShowLocDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${!locationId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                >
                  All Locations
                </button>
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => { setLocation(loc.id, loc.name); setShowLocDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${locationId === loc.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                  >
                    {loc.name}{loc.city ? ` (${loc.city})` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
