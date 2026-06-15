import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, TrendingUp, Package, BookOpen } from 'lucide-react';

export function Reports() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { path: '/reports/sales', label: 'Sales Report', desc: 'Revenue trends, order metrics, customer analytics', icon: TrendingUp, color: 'bg-blue-600' },
          { path: '/reports/inventory', label: 'Inventory Report', desc: 'Stock valuation, low stock alerts, out-of-stock items', icon: Package, color: 'bg-green-600' },
          { path: '/reports/financial', label: 'Financial Report', desc: 'Trial balance, P&L, revenue vs expenses', icon: BookOpen, color: 'bg-purple-600' },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="card hover:border-blue-300 transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tab.color} mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-gray-900">{tab.label}</p>
              <p className="text-sm text-gray-500 mt-1">{tab.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
