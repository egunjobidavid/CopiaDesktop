import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { startSync, stopSync } from './workers/sync.manager';
import { useAuthStore } from './store/auth.store';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pos } from './pages/pos/Pos';
import { Invoices } from './pages/Invoices';
import { ProductList } from './pages/products/ProductList';
import { ProductDetail } from './pages/products/ProductDetail';
import { StockView } from './pages/inventory/StockView';
import { StockMovement } from './pages/inventory/StockMovement';
import { POList } from './pages/procurement/POList';
import { POForm } from './pages/procurement/POForm';
import { PODetail } from './pages/procurement/PODetail';
import { Reports } from './pages/reports/Reports';
import { SalesReport } from './pages/reports/SalesReport';
import { InventoryReport } from './pages/reports/InventoryReport';
import { FinancialReport } from './pages/reports/FinancialReport';
import { CustomerList } from './pages/customers/CustomerList';
import { SalesOrders } from './pages/sales/SalesOrders';
import { VendorList } from './pages/vendors/VendorList';
import { Production } from './pages/production/Production';
import { Expenses } from './pages/expenses/Expenses';
import { Settings } from './pages/settings/Settings';
import { Support } from './pages/settings/Support';
import { Billing } from './pages/settings/Billing';
import { Roles } from './pages/settings/Roles';
import { RoleDetail } from './pages/settings/RoleDetail';
import { Departments } from './pages/settings/Departments';
import { Staff } from './pages/settings/Staff';
import { Locations } from './pages/settings/Locations';
import { StaffAudit } from './pages/settings/StaffAudit';
import { Approvals } from './pages/approvals/Approvals';

export function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      startSync(300000);
      return () => stopSync();
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/inventory" element={<StockView />} />
            <Route path="/inventory/movements" element={<StockMovement />} />
            <Route element={<ProtectedRoute minRole="Sales Rep" />}>
              <Route path="/pos" element={<Pos />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/sales" element={<SalesOrders />} />
            </Route>
            <Route element={<ProtectedRoute minRole="Accountant" />}>
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/vendors" element={<VendorList />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/sales" element={<SalesReport />} />
              <Route path="/reports/inventory" element={<InventoryReport />} />
              <Route path="/reports/financial" element={<FinancialReport />} />
            </Route>
            <Route element={<ProtectedRoute minRole="Manager" />}>
              <Route path="/procurement" element={<POList />} />
              <Route path="/procurement/new" element={<POForm />} />
              <Route path="/procurement/:id" element={<PODetail />} />
            </Route>
            <Route element={<ProtectedRoute minRole="Manager" feature="production" />}>
              <Route path="/production" element={<Production />} />
            </Route>
            <Route element={<ProtectedRoute minRole="Manager" />}>
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/billing" element={<Billing />} />
            </Route>
            <Route element={<ProtectedRoute minRole="Staff" module="hr" />}>
              <Route path="/settings/roles" element={<Roles />} />
              <Route path="/settings/roles/:id" element={<RoleDetail />} />
              <Route path="/settings/departments" element={<Departments />} />
              <Route path="/settings/staff" element={<Staff />} />
              <Route path="/settings/locations" element={<Locations />} />
              <Route path="/settings/audit" element={<StaffAudit />} />
            </Route>
            <Route element={<ProtectedRoute minRole="Staff" />}>
              <Route path="/settings/support" element={<Support />} />
            </Route>
            <Route element={<ProtectedRoute minRole="Accountant" feature="approvals" />}>
              <Route path="/approvals" element={<Approvals />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
