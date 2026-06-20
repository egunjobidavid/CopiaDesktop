import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  BookOpen,
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
  Shield,
  Building2,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronRight,
  LifeBuoy,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface Section {
  id: string;
  title: string;
  icon: any;
  color: string;
  articles: Article[];
}

interface Article {
  title: string;
  content: string | JSX.Element;
}

const sections: Section[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    color: 'bg-primary-100 text-primary-700',
    articles: [
      {
        title: 'Creating Your Account',
        content: (
          <div className="space-y-2">
            <p>Visit the CopiaOS website and click <strong>Sign Up</strong>. Fill in your company name, your name, email, and a password. After registration, you will be logged in automatically as the Managing Director (MD) with full access to all features.</p>
            <p>Your default role is <strong>MD</strong> with the highest access level (100). You can create additional users and assign them different roles later.</p>
          </div>
        ),
      },
      {
        title: 'Understanding Roles & Permissions',
        content: (
          <div className="space-y-2">
            <p>CopiaOS uses a role-based access control (RBAC) system. Each user is assigned a role that determines what they can see and do.</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Role</th>
                    <th className="text-left py-2 font-medium">Level</th>
                    <th className="text-left py-2 font-medium">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="py-1.5">MD</td><td>100</td><td>Full access to everything</td></tr>
                  <tr><td className="py-1.5">Director</td><td>80</td><td>Most features, limited settings</td></tr>
                  <tr><td className="py-1.5">Manager</td><td>60</td><td>Operations, some settings</td></tr>
                  <tr><td className="py-1.5">Accountant</td><td>40</td><td>Finance, invoices, vendors</td></tr>
                  <tr><td className="py-1.5">Sales Rep</td><td>30</td><td>POS, customers, sales</td></tr>
                  <tr><td className="py-1.5">Staff</td><td>10</td><td>Basic read access</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
      {
        title: 'Understanding Plan Limits',
        content: (
          <div className="space-y-2">
            <p>CopiaOS offers three plans:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Free</strong> - 1 user, all core features included</li>
              <li><strong>Monthly</strong> - 5 users, 5 locations, 5 years data retention</li>
              <li><strong>Yearly</strong> - 99 users, 99 locations, unlimited data retention</li>
            </ul>
            <p>Free plan now includes production, procurement, accounting, analytics, approvals, support, locations, and HR modules.</p>
          </div>
        ),
      },
      {
        title: 'Setting Up Your Organization',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; General</strong> to configure your organization details:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Company name (appears on invoices)</li>
              <li>Contact email and phone</li>
              <li>Address</li>
              <li>Logo (for invoice branding)</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: 'sales',
    title: 'Sales & Point of Sale',
    icon: ShoppingCart,
    color: 'bg-green-100 text-green-700',
    articles: [
      {
        title: 'Making a Sale (POS)',
        content: (
          <div className="space-y-2">
            <p>Navigate to <strong>Point of Sale</strong> in the sidebar:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Select a customer (or use Walk-in)</li>
              <li>Search for products by name or scan barcode</li>
              <li>Adjust quantities as needed</li>
              <li>Click <strong>Complete Sale</strong> to finalize</li>
              <li>A receipt/invoice is automatically generated</li>
            </ol>
            <p>The sale will be recorded and inventory will be updated automatically.</p>
          </div>
        ),
      },
      {
        title: 'Managing Customers',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Customers</strong> to manage your customer database:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Add Customer:</strong> Click "Add Customer", fill in name, email, phone, address</li>
              <li><strong>Import CSV:</strong> Bulk import customers from a spreadsheet</li>
              <li><strong>Search:</strong> Use the search bar to find customers quickly</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Viewing Sales Orders',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Sales Orders</strong> to see all transactions:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use status filters (Draft, Confirmed, Processing, Delivered, Cancelled)</li>
              <li>Search by order number or customer name</li>
              <li>View order details and totals</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Generating Invoices',
        content: (
          <div className="space-y-2">
            <p>Invoices are automatically created when you complete a sale. Go to <strong>Invoices</strong> to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Print:</strong> Click the print button to send to printer</li>
              <li><strong>Download:</strong> Download as PDF for sending to customers</li>
              <li><strong>Search:</strong> Find invoices by number or customer name</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory & Products',
    icon: Package,
    color: 'bg-blue-100 text-blue-700',
    articles: [
      {
        title: 'Adding Products',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Products</strong> and click "Add Product":</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Enter SKU (auto-generated if left blank), name, description</li>
              <li>Select product type (raw material, finished good, etc.)</li>
              <li>Set unit of measure (piece, kg, litre, etc.)</li>
              <li>Set selling price</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Importing Products via CSV',
        content: (
          <div className="space-y-2">
            <p>On the Products page, click <strong>"Import CSV"</strong>:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Download Template" to get the correct format</li>
              <li>Fill in your products in the spreadsheet</li>
              <li>Upload the completed CSV file</li>
              <li>Review the preview and confirm the import</li>
            </ol>
            <p>Required columns: sku, name, productType, uom</p>
          </div>
        ),
      },
      {
        title: 'Managing Stock Levels',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Inventory</strong> to monitor stock:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Stock View:</strong> See current quantities across all locations</li>
              <li><strong>Stock Movements:</strong> Track all stock in/out movements</li>
              <li>Low stock items are highlighted in red</li>
              <li>Use location filter to view stock at specific locations</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Multi-Location Inventory',
        content: (
          <div className="space-y-2">
            <p>If you have multiple locations (shops, warehouses, branches):</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Go to <strong>Settings &gt; Locations</strong> to create locations</li>
              <li>Use the location selector in the header to switch context</li>
              <li>Stock movements can be recorded per location</li>
              <li>Reports can be filtered by location</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: 'procurement',
    title: 'Procurement & Vendors',
    icon: ShoppingBag,
    color: 'bg-amber-100 text-amber-700',
    articles: [
      {
        title: 'Managing Vendors',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Vendors</strong> to manage your supplier database:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Add Vendor:</strong> Click "Add Vendor", fill in name, contact person, email, phone</li>
              <li><strong>Import CSV:</strong> Bulk import vendors from a spreadsheet</li>
              <li>Track outstanding balances per vendor</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Creating Purchase Orders',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Procurement &gt; Purchase Orders</strong>:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "New Purchase Order"</li>
              <li>Select the vendor/supplier</li>
              <li>Add products with quantities and unit prices</li>
              <li>Submit for approval (if approvals are enabled)</li>
              <li>Receive goods and update inventory</li>
            </ol>
          </div>
        ),
      },
    ],
  },
  {
    id: 'finance',
    title: 'Finance & Accounting',
    icon: Wallet,
    color: 'bg-purple-100 text-purple-700',
    articles: [
      {
        title: 'Recording Expenses',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Expenses</strong> to track business spending:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Add Expense"</li>
              <li>Enter description, amount, and date</li>
              <li>Optionally assign a category (e.g., Rent, Utilities, Transport)</li>
              <li>Use category filters to view expenses by type</li>
            </ol>
          </div>
        ),
      },
      {
        title: 'Managing Expense Categories',
        content: (
          <div className="space-y-2">
            <p>On the Expenses page, click <strong>"Categories"</strong> to create custom expense categories:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Examples: Rent, Utilities, Salaries, Transport, Office Supplies</li>
              <li>Categories help you filter and analyze spending patterns</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Approvals',
        content: (
          <div className="space-y-2">
            <p>If approvals are enabled on your plan, go to <strong>Approvals</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Review pending purchase orders and expenses</li>
              <li>Approve or reject with notes</li>
              <li>Approved items proceed to the next workflow step</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Running Reports',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Reports</strong> to access analytics:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Sales Report:</strong> Revenue, top products, sales trends</li>
              <li><strong>Inventory Report:</strong> Stock levels, movement history</li>
              <li><strong>Financial Report:</strong> Profit & loss, expense breakdown</li>
              <li>Filter reports by date range and location</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: 'production',
    title: 'Production',
    icon: Factory,
    color: 'bg-red-100 text-red-700',
    articles: [
      {
        title: 'Managing Production',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Production</strong> to manage manufacturing:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Create production orders with raw material requirements</li>
              <li>Track work-in-progress and completed items</li>
              <li>Raw materials are deducted from inventory automatically</li>
              <li>Finished goods are added to inventory upon completion</li>
            </ul>
            <p><strong>Note:</strong> Production is available on all plans including Free.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings & Administration',
    icon: Settings,
    color: 'bg-gray-100 text-gray-700',
    articles: [
      {
        title: 'Managing Staff',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; Staff</strong> to manage your team:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Add Staff" and enter their email and name</li>
              <li>Choose a role (determines their access level)</li>
              <li>Optionally assign to a department</li>
              <li>The staff member receives login credentials</li>
            </ol>
            <p><strong>Note:</strong> You must be Manager level or above to create staff.</p>
          </div>
        ),
      },
      {
        title: 'Creating & Customizing Roles',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; Roles</strong> to customize permissions:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Click on a role to edit its module permissions</li>
              <li>Toggle modules on/off (Dashboard, Sales, Inventory, etc.)</li>
              <li>Set the role's access level (determines who they can manage)</li>
              <li>Changes take effect immediately for all users with that role</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Managing Departments',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; Departments</strong> to organize your team:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Create departments (e.g., Sales, Finance, Operations, HR)</li>
              <li>Assign staff to departments</li>
              <li>Track department head and member count</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Setting Up Locations',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; Locations</strong> to add your business locations:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Add Location"</li>
              <li>Enter a unique code (e.g., LOC-001), name, and type</li>
              <li>Fill in address, city, state, country details</li>
              <li>Mark one location as default</li>
            </ol>
            <p>Location limits: Free=1, Monthly=5, Yearly=99</p>
          </div>
        ),
      },
      {
        title: 'Staff Audit Trail',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; Staff Audit</strong> to monitor activity:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Activity Feed:</strong> See all recent actions across the system</li>
              <li><strong>Audit Trail:</strong> View detailed before/after changes per user</li>
              <li>Filter by user, action type, or date range</li>
              <li>Track who created, updated, or deleted records</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Billing & Upgrades',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; Billing</strong> to manage your subscription:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>View your current plan and limits</li>
              <li>Upgrade to Monthly or Yearly plan via Paystack</li>
              <li>Manage payment methods and view invoices</li>
              <li>Yearly plan saves you 2 months compared to monthly</li>
            </ul>
          </div>
        ),
      },
    ],
  },
];

export function Help() {
  const navigate = useNavigate();
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleArticle = (sectionId: string, articleIdx: number) => {
    const key = `${sectionId}-${articleIdx}`;
    setExpandedArticle(expandedArticle === key ? null : key);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Help &amp; Getting Started</h1>
          <p className="page-subtitle">Guides for using every feature in CopiaOS</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Make a Sale', path: '/pos', icon: ShoppingCart, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
          { label: 'Add Product', path: '/products', icon: Package, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          { label: 'Manage Stock', path: '/inventory', icon: Warehouse, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          { label: 'View Reports', path: '/reports', icon: BarChart3, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-all ${item.color}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
            </button>
          );
        })}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = activeSection === section.id;

          return (
            <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setActiveSection(isOpen ? null : section.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${section.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-900 flex-1">{section.title}</span>
                <span className="text-xs text-gray-400 mr-2">{section.articles.length} articles</span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  {section.articles.map((article, idx) => {
                    const artKey = `${section.id}-${idx}`;
                    const isExpanded = expandedArticle === artKey;

                    return (
                      <div key={idx} className="border-b border-gray-50 last:border-b-0">
                        <button
                          onClick={() => toggleArticle(section.id, idx)}
                          className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-medium flex-1">{article.title}</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-6 pb-4 pl-12 text-sm text-gray-600 leading-relaxed">
                            {article.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
        <LifeBuoy className="w-8 h-8 text-primary-600 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-1">Still need help?</h3>
        <p className="text-sm text-gray-600 mb-3">
          Contact our support team or check the developer documentation.
        </p>
        <button
          onClick={() => navigate('/settings/support')}
          className="btn-primary text-sm"
        >
          Go to Support
        </button>
      </div>
    </div>
  );
}
