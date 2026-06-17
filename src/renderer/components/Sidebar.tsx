import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
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
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pos', label: 'Point of Sale', icon: ShoppingCart },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/inventory', label: 'Inventory', icon: Warehouse },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/sales', label: 'Sales Orders', icon: FileText },
  { path: '/invoices', label: 'Invoices', icon: Receipt },
  { path: '/vendors', label: 'Vendors', icon: ShoppingBag },
  { path: '/procurement', label: 'Procurement', icon: ClipboardList },
  { path: '/production', label: 'Production', icon: Factory },
  { path: '/expenses', label: 'Expenses', icon: Wallet },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);
  const [orgName, setOrgName] = useState('');

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

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <aside className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="font-semibold text-lg text-gray-900">CopiaOS</span>
      </div>

      {/* User info */}
      <div className="px-6 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user?.fullName || 'User'}
        </p>
        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
        {orgName && (
          <p className="text-xs text-purple-600 font-medium truncate mt-1">
            {orgName}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
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
