import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  pos: 'Point of Sale',
  products: 'Products',
  inventory: 'Inventory',
  customers: 'Customers',
  sales: 'Sales Orders',
  invoices: 'Invoices',
  vendors: 'Vendors',
  procurement: 'Procurement',
  production: 'Production',
  expenses: 'Expenses',
  approvals: 'Approvals',
  reports: 'Reports',
  settings: 'Settings',
  roles: 'Roles',
  departments: 'Departments',
  locations: 'Locations',
  staff: 'Staff',
  audit: 'Staff Audit',
  billing: 'Billing',
  support: 'Support',
  new: 'New',
  financial: 'Financial',
  salesReport: 'Sales Report',
  inventoryReport: 'Inventory Report',
};

export function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
      <button onClick={() => navigate('/dashboard')} className="hover:text-gray-700 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </button>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = routeLabels[name] || name.charAt(0).toUpperCase() + name.slice(1);

        return (
          <span key={routeTo} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{label}</span>
            ) : (
              <button onClick={() => navigate(routeTo)} className="hover:text-gray-700 transition-colors">
                {label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
