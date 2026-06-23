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
  FolderKanban,
  Send,
  Handshake,
  Briefcase,
  Calendar,
  Download,
  BarChart,
  Scissors,
  Clock,
  Repeat,
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
        title: 'Understanding Plans & Pricing',
        content: (
          <div className="space-y-2">
            <p>CopiaOS uses a <strong>Core Plan + Module Add-ons</strong> pricing model. Choose a core plan for your team size, then add modules you need.</p>
            <p className="font-medium text-gray-900">Core Plans:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Starter</strong> - Free. 2 users, 1 location. POS, products, inventory, sales, quotes, invoices.</li>
              <li><strong>Business</strong> - ₦12,000/mo (₦9,600/mo annual). 10 users, 3 locations. + Sales orders, reports, export.</li>
              <li><strong>Professional</strong> - ₦32,000/mo (₦25,600/mo annual). 50 users, 15 locations. + Phone support.</li>
              <li><strong>Enterprise</strong> - ₦75,000/mo (₦60,000/mo annual). Unlimited everything. + API, priority support, custom integrations.</li>
            </ul>
            <p className="font-medium text-gray-900">Module Add-ons (any paid plan):</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Accounting Suite</strong> - ₦10,000/mo. Chart of accounts, journal entries, trial balance, bank reconciliation.</li>
              <li><strong>HR & Payroll</strong> - ₦10,000/mo. Employees, attendance, payroll processing.</li>
              <li><strong>Projects & Time</strong> - ₦20,000/mo. Projects, tasks, kanban, time tracking.</li>
              <li><strong>CRM Pipeline</strong> - ₦10,000/mo. Deals, pipeline, activities, lead scoring.</li>
              <li><strong>Production & BOM</strong> - ₦20,000/mo. BOMs, work orders, stages, quality, equipment.</li>
              <li><strong>Procurement</strong> - ₦10,000/mo. Vendors, purchase orders, bill payments.</li>
              <li><strong>Multi-Location</strong> - ₦5,000/mo. Extra locations beyond plan limit.</li>
              <li><strong>Analytics Pro</strong> - ₦5,000/mo. Advanced reports, custom dashboards.</li>
            </ul>
            <p className="font-medium text-gray-900">Bundles (save 14-33%):</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Finance Bundle</strong> - ₦20,000/mo. Accounting + Procurement.</li>
              <li><strong>Project Bundle</strong> - ₦25,000/mo. HR + Projects + Time. (38% off)</li>
              <li><strong>Operations Bundle</strong> - ₦30,000/mo. Production + Procurement + Multi-Location.</li>
              <li><strong>Full Suite</strong> - ₦60,000/mo. All 8 modules. (33% off)</li>
            </ul>
            <p>Annual billing saves 20% on all plans and modules. Go to <strong>Settings &gt; Billing</strong> to upgrade. Payment is via Paystack (card, bank transfer, USSD).</p>
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
              <li>Click <strong>Open Drawer</strong> to start a session (enter opening cash balance)</li>
              <li>Search for products by name, SKU, or <strong>scan barcode</strong> with your device camera</li>
              <li>Adjust quantities as needed</li>
              <li>Click <strong>Checkout</strong> and select payment method (Cash, Card, Transfer)</li>
              <li>Supports <strong>split payments</strong> (e.g., part cash, part card)</li>
              <li>Click <strong>Complete Sale</strong> to finalize</li>
            </ol>
            <p>At end of day, click <strong>Z-Report</strong> to close the drawer with cash count breakdown.</p>
            <p><strong>Barcode Scanning:</strong> Products with barcodes set up in inventory can be scanned directly at POS using your device camera or a connected barcode scanner.</p>
          </div>
        ),
      },
      {
        title: 'Quotes & Estimates',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Sales &gt; Quotes</strong> to create and send quotes:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Custom Items:</strong> Add products from inventory OR type custom item names for non-standard work</li>
              <li><strong>Document Types:</strong> Choose General, Contract, Project, or Supply quote templates</li>
              <li><strong>Send to Client:</strong> Click the email icon to send a professional branded quote via email</li>
              <li><strong>Email Templates:</strong> Choose from pre-configured email templates (General, Contract, Project, Supply)</li>
              <li><strong>PDF Download:</strong> Download as PDF for printing</li>
              <li><strong>Version Control:</strong> Quotes auto-version when edited</li>
              <li><strong>Convert:</strong> Convert accepted quotes to Sales Orders or Invoices</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Invoices',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Sales &gt; Invoices</strong> to manage invoices:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Create Manually:</strong> Add any items (inventory or custom) with quantities and prices</li>
              <li><strong>From Quote:</strong> Convert a quote directly into an invoice</li>
              <li><strong>From Sales Order:</strong> Auto-generate invoice when order is fulfilled</li>
              <li><strong>Send via Email:</strong> Click the email icon, choose a template (General/Contract/Project/Supply), and send</li>
              <li><strong>Email Templates:</strong> Professional pre-built templates for different document types</li>
              <li><strong>PDF Download:</strong> Download professional invoice PDF</li>
              <li><strong>Credit Memo:</strong> Issue credit memos for returns or adjustments</li>
              <li><strong>Void:</strong> Void invoices that were issued in error</li>
            </ul>
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
        title: 'Sales Orders',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Sales &gt; Sales Orders</strong> to track orders:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use status filters (Draft, Confirmed, Processing, Delivered, Cancelled)</li>
              <li><strong>Discounts & Tax:</strong> Apply line-item discounts and tax rates</li>
              <li><strong>Delivery:</strong> Set delivery date and shipping address</li>
              <li><strong>Approval:</strong> Orders can be submitted for manager approval</li>
              <li>Convert to Invoice when ready</li>
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
              <li>Set <strong>barcode</strong> for POS scanning (use a barcode scanner or generate codes)</li>
              <li>Select product type and category</li>
              <li>Set unit of measure (piece, kg, litre, etc.)</li>
              <li>Set selling price and cost price</li>
              <li>Set <strong>reorder point</strong> for low stock alerts</li>
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
              <li><strong>Stock Transfers:</strong> Move stock between locations</li>
              <li><strong>Categories:</strong> Organize products by category</li>
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
      {
        title: 'Product Variants',
        content: (
          <div className="space-y-2">
            <p>Create products with different sizes, colors, or other attributes:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>When adding a product, click <strong>"Add Variant"</strong> to create variants</li>
              <li>Each variant gets its own SKU, price, and barcode</li>
              <li>Stock is tracked per variant (e.g., Size M in Blue vs Size L in Red)</li>
              <li>Variants appear as selectable options at POS and on quotes/invoices</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: 'crm',
    title: 'CRM & Pipeline',
    icon: Briefcase,
    color: 'bg-teal-100 text-teal-700',
    articles: [
      {
        title: 'Managing Deals',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>CRM</strong> to manage your sales pipeline:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Pipeline View:</strong> See deals organized by stage (Lead, Proposal, Negotiation, Won, Lost)</li>
              <li><strong>Create Deal:</strong> Add deal name, value, stage, and assignee</li>
              <li><strong>Activities:</strong> Log calls, meetings, emails, and tasks against deals</li>
              <li><strong>Notes:</strong> Add internal notes visible to your team</li>
              <li><strong>Tags:</strong> Categorize deals with color-coded tags</li>
              <li><strong>Customer Link:</strong> Link deals to existing customers for a unified view</li>
              <li><strong>Convert:</strong> Won deals can be converted to quotes or invoices</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Pipeline Reports & Forecasting',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>CRM &gt; Reports</strong> to analyze your pipeline:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Pipeline Report:</strong> View deal values by stage, conversion rates, and win/loss ratios</li>
              <li><strong>Revenue Forecast:</strong> See projected revenue from open deals weighted by probability</li>
              <li><strong>Activity Reports:</strong> Track team activity levels and deal velocity</li>
              <li>Filter by date range, assignee, or deal value</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Email Templates for Deals',
        content: (
          <div className="space-y-2">
            <p>Create reusable email templates for consistent client communication:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Go to <strong>CRM &gt; Email Templates</strong> to manage templates</li>
              <li>Create templates with placeholders (e.g., {customerName}, {dealValue})</li>
              <li>Use the <strong>Preview</strong> button to see how the email will look</li>
              <li>Send emails directly from deal detail views</li>
              <li>Supports HTML formatting for professional-looking emails</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: 'projects',
    title: 'Project Management',
    icon: FolderKanban,
    color: 'bg-indigo-100 text-indigo-700',
    articles: [
      {
        title: 'Creating Your First Project',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Projects</strong> in the sidebar to manage your projects:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "New Project" to create a project</li>
              <li>Enter a name, description, priority, and due date</li>
              <li>Choose a color to identify the project visually</li>
              <li>Click "Create Project" to save</li>
            </ol>
            <p>Projects are available on Professional plan and above.</p>
          </div>
        ),
      },
      {
        title: 'Managing Tasks with Kanban Board',
        content: (
          <div className="space-y-2">
            <p>Open a project to see the <strong>Kanban Board</strong> view:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>To Do:</strong> Tasks waiting to be started</li>
              <li><strong>In Progress:</strong> Tasks currently being worked on</li>
              <li><strong>In Review:</strong> Tasks awaiting review or approval</li>
              <li><strong>Done:</strong> Completed tasks</li>
            </ul>
            <p><strong>Drag and drop</strong> tasks between columns to update their status. You can also use the <strong>List</strong> view for a table-based layout.</p>
          </div>
        ),
      },
      {
        title: 'Task Details & Features',
        content: (
          <div className="space-y-2">
            <p>Click on any task to open the <strong>Task Detail</strong> panel:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Description:</strong> Add detailed notes about the task</li>
              <li><strong>Subtasks:</strong> Break tasks into smaller actionable items with checkboxes</li>
              <li><strong>Priority:</strong> Set Low, Medium, High, or Urgent priority</li>
              <li><strong>Due Date:</strong> Set deadlines (overdue tasks are highlighted in red)</li>
              <li><strong>Time Tracking:</strong> Track estimated vs actual hours spent</li>
              <li><strong>Labels:</strong> Add color-coded labels for categorization</li>
              <li><strong>Comments:</strong> Discuss tasks with your team in the comments section</li>
              <li><strong>Activity Log:</strong> See the complete history of changes</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Timeline / Gantt View',
        content: (
          <div className="space-y-2">
            <p>The <strong>Timeline</strong> tab shows tasks as horizontal bars:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Tasks with due dates are displayed on a timeline</li>
              <li>Bar length represents the estimated duration</li>
              <li>Quickly identify overlapping tasks and schedule conflicts</li>
              <li>Click on any bar to open task details</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Team Collaboration',
        content: (
          <div className="space-y-2">
            <p>Collaborate with your team on projects:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Project Members:</strong> Add team members to projects with Lead, Member, or Viewer roles</li>
              <li><strong>Assignees:</strong> Assign tasks to specific team members</li>
              <li><strong>Comments:</strong> Discuss tasks in real-time with threaded comments</li>
              <li><strong>File Attachments:</strong> Attach files directly to tasks (documents, images, PDFs)</li>
              <li><strong>Activity Feed:</strong> Stay updated on all project changes</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Recurring Tasks',
        content: (
          <div className="space-y-2">
            <p>Automate repetitive work with recurring tasks:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Go to <strong>Projects &gt; Recurring Tasks</strong> to view all recurring tasks</li>
              <li>Set a task to repeat daily, weekly, monthly, or on a custom schedule</li>
              <li>Each recurrence automatically creates a new task instance</li>
              <li>Track which recurring tasks are active and when the next one is due</li>
              <li>Great for weekly reports, monthly reviews, daily standups, etc.</li>
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
        title: 'Chart of Accounts',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Accounting &gt; Chart of Accounts</strong> to set up your ledger:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click <strong>"Add Account"</strong> to create new accounts</li>
              <li>Enter a unique code (e.g., 1000 for Cash, 2000 for Accounts Payable)</li>
              <li>Choose a type: Asset, Liability, Equity, Revenue, or Expense</li>
              <li>Toggle accounts active/inactive as needed</li>
              <li>Use filter tabs to view accounts by type</li>
            </ol>
            <p><strong>Tip:</strong> Most businesses start with 10-20 core accounts. Add more as needed.</p>
          </div>
        ),
      },
      {
        title: 'Creating Journal Entries',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Accounting &gt; General Ledger</strong> to create journal entries:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click <strong>"New Journal Entry"</strong></li>
              <li>Enter a description (e.g., "Office rent payment")</li>
              <li>Add journal lines: select account code, enter debit or credit amount</li>
              <li><strong>Debits must equal credits</strong> — the form shows balance validation</li>
              <li>Add at least 2 lines per entry</li>
              <li>Click <strong>"Post Entry"</strong> to save</li>
            </ol>
            <p><strong>Example:</strong> Paying rent of ₦50,000 → Debit Rent Expense (5000), Credit Cash (1000)</p>
          </div>
        ),
      },
      {
        title: 'General Ledger & Trial Balance',
        content: (
          <div className="space-y-2">
            <p>View your financial data in two ways:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>General Ledger:</strong> See all journal entries with date, description, status, and line details</li>
              <li><strong>Trial Balance:</strong> See aggregated balances per account — verify debits equal credits</li>
            </ul>
            <p>Use the date filter on Trial Balance to view balances as of a specific date. Export to CSV for external reporting.</p>
          </div>
        ),
      },
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
        title: 'Bank Reconciliation',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Accounting &gt; Bank Reconciliation</strong> to match bank statements with your books:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Import Bank Statement:</strong> Upload a CSV from your bank</li>
              <li><strong>Auto-Match:</strong> System matches transactions by amount and date</li>
              <li><strong>Manual Match:</strong> Drag unmatched items together</li>
              <li><strong>Bank Rules:</strong> Create rules for recurring transaction categories</li>
              <li><strong>Reconciliation Report:</strong> Verify balances match</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Fiscal Year & Period Management',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Accounting &gt; Fiscal Periods</strong> to manage your financial periods:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Create Periods:</strong> Define fiscal year start/end dates (e.g., Jan 1 - Dec 31)</li>
              <li><strong>Close Period:</strong> Lock a period to prevent further journal entries (end-of-month/year closing)</li>
              <li><strong>Reopen Period:</strong> Reopen a closed period if corrections are needed (admin only)</li>
              <li>Closed periods ensure historical financial data integrity</li>
            </ul>
            <p><strong>Tip:</strong> Close periods monthly for clean financial reporting. Only MD or Director roles can close/reopen periods.</p>
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
    title: 'Production & Manufacturing',
    icon: Factory,
    color: 'bg-red-100 text-red-700',
    articles: [
      {
        title: 'Bill of Materials (BOM)',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Production &gt; BOMs</strong> to define how products are made:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Create BOMs linking raw materials to finished goods</li>
              <li>Define quantities of each raw material needed</li>
              <li>Set production stages and time estimates</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Work Orders & Production Tracking',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Production &gt; Work Orders</strong> to track manufacturing:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Create work orders from BOMs</li>
              <li>Track work-in-progress through production stages</li>
              <li>Quality inspections at each stage</li>
              <li>Raw materials deducted from inventory automatically</li>
              <li>Finished goods added to inventory upon completion</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Equipment & Maintenance',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Production &gt; Equipment</strong> to manage machinery:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Track equipment status and utilization</li>
              <li>Schedule preventive maintenance</li>
              <li>Log maintenance history and costs</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: 'hr',
    title: 'HR & People',
    icon: Users,
    color: 'bg-pink-100 text-pink-700',
    articles: [
      {
        title: 'Managing Employees',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>HR &gt; Employees</strong> to manage your team:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Add Employee:</strong> Click "Add Employee", fill in employee code, name, email, phone, department, position, and salary</li>
              <li><strong>Edit Employee:</strong> Click the edit icon to update any employee details</li>
              <li><strong>Filter by Status:</strong> Use tabs to filter by Active, Inactive, or Terminated employees</li>
              <li><strong>Employee Codes:</strong> Use unique codes like EMP-001, EMP-002 for easy identification</li>
              <li><strong>Salary:</strong> Set base salary for payroll processing (in Naira)</li>
              <li><strong>Bank & Tax:</strong> Optionally add bank account and tax ID for payroll</li>
            </ul>
            <p><strong>Note:</strong> HR module requires Professional plan or above.</p>
          </div>
        ),
      },
      {
        title: 'Employee Onboarding',
        content: (
          <div className="space-y-2">
            <p>Streamline new hire setup with the onboarding workflow:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>After creating an employee, go to <strong>HR &gt; Onboarding</strong></li>
              <li>Track onboarding progress per employee (documents, equipment, training, etc.)</li>
              <li>Mark items as completed and see overall completion percentage</li>
              <li>View onboarding status for all new employees in one place</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Attendance & Time Tracking',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>HR &gt; Attendance</strong> to track work hours:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Quick Clock In/Out:</strong> Use the quick action buttons at the top to clock in or out for any employee</li>
              <li><strong>Filter by Employee:</strong> Select a specific employee from the dropdown</li>
              <li><strong>Date Range:</strong> Set a date range to view attendance history</li>
              <li><strong>Hours Tracking:</strong> Total hours worked are calculated automatically</li>
              <li><strong>Attendance Log:</strong> View all clock-in/out records with timestamps</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Leave Management',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>HR &gt; Leave</strong> to manage time-off requests:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Leave Types:</strong> Admins configure leave types (Annual, Sick, Maternity, etc.) with default days per year</li>
              <li><strong>Request Leave:</strong> Employees submit leave requests with start/end dates and reason</li>
              <li><strong>Approve/Reject:</strong> Managers review and approve or reject requests with notes</li>
              <li><strong>Leave Balances:</strong> View remaining leave days per employee per leave type</li>
              <li><strong>Leave History:</strong> Track all past and upcoming leave for each employee</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Payroll Processing',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>HR &gt; Payroll</strong> to manage payroll:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click <strong>"Process Payroll"</strong> to start a new payroll run</li>
              <li>Set the pay period (start and end dates)</li>
              <li>The system creates payroll lines for all active employees with a salary</li>
              <li>Review the payroll run in the table</li>
              <li><strong>Approve:</strong> Click the checkmark to approve the payroll</li>
              <li><strong>Mark as Paid:</strong> Click the dollar icon to mark as paid</li>
              <li><strong>View Details:</strong> Click the eye icon to see individual employee breakdowns</li>
            </ol>
            <p><strong>Payroll statuses:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Draft:</strong> Newly created, not yet reviewed</li>
              <li><strong>Processing:</strong> Being reviewed</li>
              <li><strong>Approved:</strong> Reviewed and ready for payment</li>
              <li><strong>Paid:</strong> Payment completed</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Configurable Deductions',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>HR &gt; Deductions</strong> to set up payroll deductions:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Create Deduction Types:</strong> Define deductions (Tax, Pension, Health Insurance, Loan, etc.)</li>
              <li><strong>Fixed or Percentage:</strong> Set as a fixed amount or percentage of gross pay</li>
              <li><strong>Auto-Apply:</strong> Enabled deductions are automatically applied during payroll processing</li>
              <li><strong>Employee-Level:</strong> Override deduction amounts per employee when needed</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Payslips',
        content: (
          <div className="space-y-2">
            <p>Generate and distribute payslips after payroll processing:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>After approving a payroll run, click the <strong>download icon</strong> on any payroll line</li>
              <li>A professional payslip opens in a new window — ready to print or save as PDF</li>
              <li>Payslips show: employee info, gross pay, all deductions breakdown, and net pay</li>
              <li>Payslips include the company name and pay period for record-keeping</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Expense Claims',
        content: (
          <div className="space-y-2">
            <p>Employees can submit out-of-pocket expenses for reimbursement:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Submit Claim:</strong> Go to <strong>HR &gt; Expense Claims</strong>, enter category, amount, date, and description</li>
              <li><strong>Attach Receipt:</strong> Upload a receipt image or PDF for verification</li>
              <li><strong>Approval Workflow:</strong> Managers approve or reject claims with notes</li>
              <li><strong>Track Status:</strong> View all claims by status (Pending, Approved, Rejected, Paid)</li>
              <li><strong>Summary Report:</strong> See total claims by category and employee</li>
            </ul>
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
            <p>Limits: Starter=2 users/1 location, Business=10 users/3 locations, Professional=30 users/15 locations, Enterprise=100 users/25 locations. Extra locations available via Multi-Location add-on (₦5,000/mo).</p>
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
              <li><strong>Compare Plans:</strong> Switch to the Compare Plans tab to see all plan features side-by-side</li>
              <li><strong>Core Plans:</strong> Choose Starter (free), Business, Professional, or Enterprise based on team size</li>
              <li><strong>Module Add-ons:</strong> Enable modules like Accounting, HR, Projects, CRM, Production, Procurement individually</li>
              <li><strong>Bundles:</strong> Save 14-38% by bundling related modules together</li>
              <li>Payment is via Paystack (card, bank transfer, USSD)</li>
              <li>Annual billing saves 20% on all plans and modules</li>
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
          { label: 'Create Quote', path: '/quotes', icon: FileText, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          { label: 'Send Invoice', path: '/invoices', icon: Send, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          { label: 'CRM Pipeline', path: '/crm', icon: Briefcase, color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
          { label: 'Journal Entry', path: '/accounting/general-ledger', icon: BookOpen, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
          { label: 'Chart of Accounts', path: '/accounting/chart-of-accounts', icon: Wallet, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
          { label: 'Employees', path: '/hr/employees', icon: Users, color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
          { label: 'Billing', path: '/settings/billing', icon: CreditCard, color: 'bg-gray-50 text-gray-700 hover:bg-gray-100' },
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
