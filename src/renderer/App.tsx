import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { startSync, stopSync } from './workers/sync.manager';
import { useAuthStore } from './store/auth.store';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Pos = lazy(() => import('./pages/pos/Pos').then((m) => ({ default: m.Pos })));
const Invoices = lazy(() => import('./pages/Invoices').then((m) => ({ default: m.Invoices })));
const ProductList = lazy(() => import('./pages/products/ProductList').then((m) => ({ default: m.ProductList })));
const ProductDetail = lazy(() => import('./pages/products/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const StockView = lazy(() => import('./pages/inventory/StockView').then((m) => ({ default: m.StockView })));
const StockMovement = lazy(() => import('./pages/inventory/StockMovement').then((m) => ({ default: m.StockMovement })));
const POList = lazy(() => import('./pages/procurement/POList').then((m) => ({ default: m.POList })));
const POForm = lazy(() => import('./pages/procurement/POForm').then((m) => ({ default: m.POForm })));
const PODetail = lazy(() => import('./pages/procurement/PODetail').then((m) => ({ default: m.PODetail })));
const Reports = lazy(() => import('./pages/reports/Reports').then((m) => ({ default: m.Reports })));
const SalesReport = lazy(() => import('./pages/reports/SalesReport').then((m) => ({ default: m.SalesReport })));
const InventoryReport = lazy(() => import('./pages/reports/InventoryReport').then((m) => ({ default: m.InventoryReport })));
const FinancialReport = lazy(() => import('./pages/reports/FinancialReport').then((m) => ({ default: m.FinancialReport })));
const CustomerList = lazy(() => import('./pages/customers/CustomerList').then((m) => ({ default: m.CustomerList })));
const SalesOrders = lazy(() => import('./pages/sales/SalesOrders').then((m) => ({ default: m.SalesOrders })));
const Quotes = lazy(() => import('./pages/sales/Quotes').then((m) => ({ default: m.Quotes })));
const VendorList = lazy(() => import('./pages/vendors/VendorList').then((m) => ({ default: m.VendorList })));
const VendorBillPayment = lazy(() => import('./pages/procurement/VendorBillPayment').then((m) => ({ default: m.VendorBillPayment })));
const Production = lazy(() => import('./pages/production/Production').then((m) => ({ default: m.Production })));
const Expenses = lazy(() => import('./pages/expenses/Expenses').then((m) => ({ default: m.Expenses })));
const Settings = lazy(() => import('./pages/settings/Settings').then((m) => ({ default: m.Settings })));
const Support = lazy(() => import('./pages/settings/Support').then((m) => ({ default: m.Support })));
const Billing = lazy(() => import('./pages/settings/Billing').then((m) => ({ default: m.Billing })));
const Roles = lazy(() => import('./pages/settings/Roles').then((m) => ({ default: m.Roles })));
const RoleDetail = lazy(() => import('./pages/settings/RoleDetail').then((m) => ({ default: m.RoleDetail })));
const Departments = lazy(() => import('./pages/settings/Departments').then((m) => ({ default: m.Departments })));
const Staff = lazy(() => import('./pages/settings/Staff').then((m) => ({ default: m.Staff })));
const Locations = lazy(() => import('./pages/settings/Locations').then((m) => ({ default: m.Locations })));
const StaffAudit = lazy(() => import('./pages/settings/StaffAudit').then((m) => ({ default: m.StaffAudit })));
const Approvals = lazy(() => import('./pages/approvals/Approvals').then((m) => ({ default: m.Approvals })));
const ChartOfAccounts = lazy(() => import('./pages/accounting/ChartOfAccounts').then((m) => ({ default: m.ChartOfAccounts })));
const GeneralLedger = lazy(() => import('./pages/accounting/GeneralLedger').then((m) => ({ default: m.GeneralLedger })));
const TrialBalance = lazy(() => import('./pages/accounting/TrialBalance').then((m) => ({ default: m.TrialBalance })));
const TaxConfig = lazy(() => import('./pages/accounting/TaxConfig').then((m) => ({ default: m.TaxConfig })));
const BankReconciliation = lazy(() => import('./pages/accounting/BankReconciliation').then((m) => ({ default: m.BankReconciliation })));
const Help = lazy(() => import('./pages/Help').then((m) => ({ default: m.Help })));
const OnboardingWizard = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.OnboardingWizard })));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
    </div>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

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
        <Route path="/login" element={<LazyPage><Login /></LazyPage>} />
        <Route path="/register" element={<LazyPage><Login /></LazyPage>} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<LazyPage><Dashboard /></LazyPage>} />
            <Route path="/products" element={<LazyPage><ProductList /></LazyPage>} />
            <Route path="/products/:id" element={<LazyPage><ProductDetail /></LazyPage>} />
            <Route path="/inventory" element={<LazyPage><StockView /></LazyPage>} />
            <Route path="/inventory/movements" element={<LazyPage><StockMovement /></LazyPage>} />
            <Route element={<ProtectedRoute minRole="Sales Rep" />}>
              <Route path="/pos" element={<LazyPage><Pos /></LazyPage>} />
              <Route path="/customers" element={<LazyPage><CustomerList /></LazyPage>} />
              <Route path="/sales" element={<LazyPage><SalesOrders /></LazyPage>} />
              <Route path="/quotes" element={<LazyPage><Quotes /></LazyPage>} />
            </Route>
            <Route element={<ProtectedRoute minRole="Accountant" />}>
              <Route path="/invoices" element={<LazyPage><Invoices /></LazyPage>} />
              <Route path="/vendors" element={<LazyPage><VendorList /></LazyPage>} />
              <Route path="/expenses" element={<LazyPage><Expenses /></LazyPage>} />
              <Route path="/reports" element={<LazyPage><Reports /></LazyPage>} />
              <Route path="/reports/sales" element={<LazyPage><SalesReport /></LazyPage>} />
              <Route path="/reports/inventory" element={<LazyPage><InventoryReport /></LazyPage>} />
              <Route path="/reports/financial" element={<LazyPage><FinancialReport /></LazyPage>} />
              <Route path="/accounting/chart-of-accounts" element={<LazyPage><ChartOfAccounts /></LazyPage>} />
              <Route path="/accounting/general-ledger" element={<LazyPage><GeneralLedger /></LazyPage>} />
              <Route path="/accounting/trial-balance" element={<LazyPage><TrialBalance /></LazyPage>} />
              <Route path="/accounting/tax-config" element={<LazyPage><TaxConfig /></LazyPage>} />
              <Route path="/accounting/bank-reconciliation" element={<LazyPage><BankReconciliation /></LazyPage>} />
            </Route>
            <Route element={<ProtectedRoute minRole="Manager" />}>
              <Route path="/procurement" element={<LazyPage><POList /></LazyPage>} />
              <Route path="/procurement/new" element={<LazyPage><POForm /></LazyPage>} />
              <Route path="/procurement/:id" element={<LazyPage><PODetail /></LazyPage>} />
              <Route path="/procurement/payments" element={<LazyPage><VendorBillPayment /></LazyPage>} />
            </Route>
            <Route element={<ProtectedRoute minRole="Manager" feature="production" />}>
              <Route path="/production" element={<LazyPage><Production /></LazyPage>} />
            </Route>
            <Route element={<ProtectedRoute minRole="Manager" />}>
              <Route path="/settings" element={<LazyPage><Settings /></LazyPage>} />
              <Route path="/settings/billing" element={<LazyPage><Billing /></LazyPage>} />
            </Route>
            <Route element={<ProtectedRoute minRole="Staff" module="hr" />}>
              <Route path="/settings/roles" element={<LazyPage><Roles /></LazyPage>} />
              <Route path="/settings/roles/:id" element={<LazyPage><RoleDetail /></LazyPage>} />
              <Route path="/settings/departments" element={<LazyPage><Departments /></LazyPage>} />
              <Route path="/settings/staff" element={<LazyPage><Staff /></LazyPage>} />
              <Route path="/settings/locations" element={<LazyPage><Locations /></LazyPage>} />
              <Route path="/settings/audit" element={<LazyPage><StaffAudit /></LazyPage>} />
            </Route>
            <Route element={<ProtectedRoute minRole="Staff" />}>
              <Route path="/settings/support" element={<LazyPage><Support /></LazyPage>} />
              <Route path="/help" element={<LazyPage><Help /></LazyPage>} />
              <Route path="/onboarding" element={<LazyPage><OnboardingWizard /></LazyPage>} />
            </Route>
            <Route element={<ProtectedRoute minRole="Accountant" feature="approvals" />}>
              <Route path="/approvals" element={<LazyPage><Approvals /></LazyPage>} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
