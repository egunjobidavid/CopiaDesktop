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
import { TUTORIAL_CONTENT } from '../data/tutorial-content';

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

function generateTutorial(): string {
  return TUTORIAL_CONTENT;
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
            <p>Visit the CopiaOS website and click <strong>Sign Up</strong>. Fill in your company name, your name, email, and a password.</p>
            <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
              <p className="font-bold text-gray-700 mb-1">Example:</p>
              <p>Company: "Lagos Trading Co."</p>
              <p>Name: "Adebayo Johnson"</p>
              <p>Email: adebayo@lagostrading.com</p>
            </div>
            <p>After registration, you are logged in automatically as the <strong>Managing Director (MD)</strong> with full access (level 100). You can create additional users and assign roles later.</p>
          </div>
        ),
      },
      {
        title: 'Understanding Roles & Permissions',
        content: (
          <div className="space-y-2">
            <p>CopiaOS uses role-based access control (RBAC). Each user has a role that determines what they can see and do.</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Role</th>
                    <th className="text-left py-2 font-medium">Level</th>
                    <th className="text-left py-2 font-medium">Can Do</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="py-1.5 font-medium">MD</td><td>100</td><td>Everything — settings, billing, all modules</td></tr>
                  <tr><td className="py-1.5 font-medium">Director</td><td>80</td><td>Most features, limited billing/settings</td></tr>
                  <tr><td className="py-1.5 font-medium">Manager</td><td>60</td><td>Operations, approve requests, manage staff</td></tr>
                  <tr><td className="py-1.5 font-medium">Accountant</td><td>40</td><td>Accounting, invoices, journal entries, reports</td></tr>
                  <tr><td className="py-1.5 font-medium">Sales Rep</td><td>30</td><td>POS, customers, quotes, sales orders</td></tr>
                  <tr><td className="py-1.5 font-medium">Staff</td><td>10</td><td>Basic read access, own profile</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-blue-700 mb-1">Example:</p>
              <p>A Sales Rep can create quotes and make POS sales, but cannot access Accounting or change Settings. An Accountant can manage the ledger but cannot process sales.</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Understanding Plans & Pricing',
        content: (
          <div className="space-y-2">
            <p>CopiaOS uses a <strong>Core Plan + Module Add-ons</strong> pricing model. Choose a core plan for your team size, then add modules you need.</p>
            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2">
              <p className="font-bold text-gray-700">Core Plans:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Starter (Free)</strong> — 2 users, 1 location. POS, products, inventory, sales, quotes, invoices.</li>
                <li><strong>Business</strong> — ₦12,000/mo. 10 users, 3 locations. + Sales orders, reports.</li>
                <li><strong>Professional</strong> — ₦32,000/mo. 50 users, 15 locations. + Phone support.</li>
                <li><strong>Enterprise</strong> — ₦75,000/mo. Unlimited everything. + API, priority support.</li>
              </ul>
              <p className="font-bold text-gray-700">Module Add-ons (any paid plan):</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Accounting Suite</strong> — ₦10,000/mo. Chart of accounts, journals, trial balance.</li>
                <li><strong>HR & Payroll</strong> — ₦10,000/mo. Employees, attendance, payroll.</li>
                <li><strong>Projects</strong> — ₦20,000/mo. Tasks, kanban, time tracking.</li>
                <li><strong>CRM Pipeline</strong> — ₦10,000/mo. Deals, pipeline, activities.</li>
                <li><strong>Production & BOM</strong> — ₦20,000/mo. BOMs, work orders.</li>
                <li><strong>Procurement</strong> — ₦10,000/mo. Vendors, purchase orders.</li>
              </ul>
              <p className="font-bold text-gray-700">Bundles (save 14-33%):</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Finance Bundle</strong> — ₦20,000/mo. Accounting + Procurement.</li>
                <li><strong>Full Suite</strong> — ₦60,000/mo. All 8 modules (33% off).</li>
              </ul>
            </div>
            <p>Go to <strong>Settings &gt; Billing</strong> to upgrade. Payment via Paystack (card, bank transfer, USSD).</p>
          </div>
        ),
      },
      {
        title: 'Setting Up Your Organization',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; General</strong> to configure:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Company name (appears on invoices and documents)</li>
              <li>Contact email and phone</li>
              <li>Business address</li>
              <li>Company logo (for invoice branding)</li>
            </ul>
            <div className="bg-green-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-green-700 mb-1">Example Setup:</p>
              <p>Company: "Lagos Trading Co." — 15 Broad Street, Lagos Island — +234 801 234 5678 — info@lagostrading.com</p>
            </div>
            <p>Then set up your first <strong>Location</strong> under Settings &gt; Locations (e.g., "Lagos Main Store" or "Head Office").</p>
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
              <li>Click <strong>Open Drawer</strong> — enter opening cash balance (e.g., ₦10,000)</li>
              <li>Search products by name, SKU, or <strong>scan barcode</strong></li>
              <li>Adjust quantities as needed</li>
              <li>Click <strong>Checkout</strong> — select payment method (Cash, Card, Transfer)</li>
              <li>Supports <strong>split payments</strong> (e.g., part cash, part card)</li>
              <li>Click <strong>Complete Sale</strong></li>
            </ol>
            <div className="bg-green-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-green-700 mb-1">Walkthrough Example:</p>
              <p>1. Open drawer with ₦10,000</p>
              <p>2. Add: Wireless Mouse (₦8,500 x 2) + Printer Paper (₦3,500 x 3)</p>
              <p>3. Total: ₦27,500</p>
              <p>4. Customer pays ₦30,000 cash</p>
              <p>5. Change due: ₦2,500</p>
              <p>6. Complete sale, close drawer at end of day with Z-Report</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Quotes & Estimates',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Sales &gt; Quotes</strong> to create and send quotes:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Custom Items:</strong> Add products from inventory OR type custom item names</li>
              <li><strong>Document Types:</strong> Choose General, Contract, Project, or Supply templates</li>
              <li><strong>Send via Email:</strong> Click email icon, choose template, send</li>
              <li><strong>PDF Download:</strong> Download as PDF for printing</li>
              <li><strong>Convert:</strong> Convert accepted quotes to Sales Orders or Invoices</li>
            </ul>
            <div className="bg-blue-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-blue-700 mb-1">Example:</p>
              <p>Create quote for Zenith Bank: 20 Office Chairs @ ₦150,000 + 20 Wireless Mice @ ₦8,500 = ₦3,170,000. Send via email with Contract template. When accepted, convert to Invoice.</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Invoices',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Sales &gt; Invoices</strong> to manage invoices:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Create Manually:</strong> Add any items with quantities and prices</li>
              <li><strong>From Quote:</strong> Convert a quote directly into an invoice</li>
              <li><strong>From Sales Order:</strong> Auto-generate when order is fulfilled</li>
              <li><strong>Send via Email:</strong> Choose from General/Contract/Project/Supply templates</li>
              <li><strong>Record Payment:</strong> Track partial or full payments</li>
              <li><strong>Credit Memo:</strong> Issue credit memos for returns</li>
              <li><strong>Void:</strong> Void invoices issued in error</li>
            </ul>
            <div className="bg-purple-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-purple-700 mb-1">Example Flow:</p>
              <p>Quote (Zenith Bank, ₦3.17M) → Sales Order → Invoice INV-00001 → Record Payment (Bank Transfer, ₦3.17M) → Status: Paid</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Managing Customers',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Customers</strong> to manage your customer database:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Add Customer:</strong> Name, email, phone, address</li>
              <li><strong>Import CSV:</strong> Bulk import from spreadsheet</li>
              <li><strong>Search:</strong> Find customers quickly</li>
            </ul>
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-gray-700 mb-1">Example Customers:</p>
              <p>Zenith Bank Plc — accounts@zenithbank.com — 45 Marina, Lagos Island</p>
              <p>MTN Nigeria — procurement@mtn.com — 4 Udo Udoma Avenue, Uyo</p>
              <p>Dangote Industries — purchase@dangote.com — 1 Oba Akran Avenue, Ikeja</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Sales Orders',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Sales &gt; Sales Orders</strong> to track orders:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Statuses: Draft → Confirmed → Processing → Delivered → Cancelled</li>
              <li><strong>Discounts & Tax:</strong> Apply line-item discounts and tax rates</li>
              <li><strong>Delivery:</strong> Set delivery date and shipping address</li>
              <li>Convert to Invoice when ready</li>
            </ul>
            <div className="bg-amber-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-amber-700 mb-1">Example:</p>
              <p>SO-00001: Zenith Bank — 20 Chairs + 20 Mice — Delivery: Jan 30 — Status: Confirmed</p>
              <p>→ Convert to Invoice INV-00001 → Record payment → Complete</p>
            </div>
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
              <li>Set <strong>barcode</strong> for POS scanning</li>
              <li>Select product type: Finished Good, Raw Material, Consumable, or Service</li>
              <li>Set unit of measure (piece, kg, litre, pack)</li>
              <li>Set selling price and cost price</li>
              <li>Set <strong>reorder point</strong> for low stock alerts</li>
            </ul>
            <div className="bg-blue-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-blue-700 mb-1">Example Products:</p>
              <p>LAP-001 | Laptop Computer | ₦450,000 | Cost: ₦350,000 | Reorder: 5</p>
              <p>MS-001 | Wireless Mouse | ₦8,500 | Cost: ₦5,000 | Reorder: 20</p>
              <p>PAP-001 | Printer Paper A4 | ₦3,500 | Cost: ₦2,000 | Reorder: 50</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Importing Products via CSV',
        content: (
          <div className="space-y-2">
            <p>On the Products page, click <strong>"Import CSV"</strong>:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Download Template" for the correct format</li>
              <li>Fill in products in the spreadsheet</li>
              <li>Upload the completed CSV</li>
              <li>Review preview and confirm import</li>
            </ol>
            <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
              <p className="font-bold text-gray-700 mb-1">CSV Format:</p>
              <p>sku,name,productType,uom,unitPrice,costPrice</p>
              <p>TNR-001,Toner Cartridge,finished_good,pcs,12000,8000</p>
              <p>USB-001,USB Cable,finished_good,pcs,2500,1200</p>
            </div>
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
              <li>Low stock items are highlighted in red</li>
              <li>Use location filter to view specific locations</li>
            </ul>
            <div className="bg-blue-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-blue-700 mb-1">Example:</p>
              <p>Lagos Main Store: 12 Laptops, 40 Mice, 100 Paper packs</p>
              <p>Abuja Warehouse: 3 Laptops, 10 Mice, 0 Paper packs</p>
              <p>Transfer: 5 Mice from Lagos → Abuja</p>
            </div>
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
              <li>Stock movements are tracked per location</li>
              <li>Reports can be filtered by location</li>
            </ul>
            <div className="bg-amber-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-amber-700 mb-1">Location Limits:</p>
              <p>Starter: 1 location | Business: 3 | Professional: 15 | Enterprise: 25</p>
              <p>Extra locations: ₦5,000/mo add-on</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Stock Take (Physical Count)',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Inventory &gt; Stock Take</strong> to reconcile physical vs system counts:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Select the location to count</li>
              <li>Enter physical count for each product</li>
              <li>System shows the expected count</li>
              <li>Differences are highlighted</li>
              <li>Submit to adjust stock to match physical count</li>
            </ol>
            <div className="bg-green-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-green-700 mb-1">Example:</p>
              <p>System: 12 Laptops | Physical count: 11 Laptops</p>
              <p>Difference: -1 → Adjust stock to 11</p>
            </div>
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
              <li><strong>Pipeline View:</strong> Deals organized by stage (Lead → Proposal → Negotiation → Won → Lost)</li>
              <li><strong>Activities:</strong> Log calls, meetings, emails against deals</li>
              <li><strong>Customer Link:</strong> Link deals to existing customers</li>
              <li><strong>Convert:</strong> Won deals → quotes or invoices</li>
            </ul>
            <div className="bg-teal-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-teal-700 mb-1">Example Deal Flow:</p>
              <p>1. New Lead: "Zenith Bank — Office Furniture Supply" (₦3M)</p>
              <p>2. Activity: Call — "Procurement needs 20 chairs"</p>
              <p>3. Move to Proposal — Send quote for ₦3.17M</p>
              <p>4. Negotiation — Counter-offer at ₦140K/chair</p>
              <p>5. Won — Convert to Invoice → Record payment</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Pipeline Reports & Forecasting',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>CRM &gt; Reports</strong> to analyze your pipeline:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Pipeline Report:</strong> Deal values by stage, conversion rates</li>
              <li><strong>Revenue Forecast:</strong> Projected revenue from open deals</li>
              <li><strong>Activity Reports:</strong> Team activity levels</li>
              <li>Filter by date range, assignee, or deal value</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Email Templates for Deals',
        content: (
          <div className="space-y-2">
            <p>Create reusable email templates for consistent communication:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Go to <strong>CRM &gt; Email Templates</strong></li>
              <li>Create templates with placeholders ({'{'}customerName{'}'}, {'{'}dealValue{'}'})</li>
              <li>Send emails directly from deal detail views</li>
              <li>Supports HTML formatting</li>
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
            <p>Go to <strong>Projects</strong> in the sidebar:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "New Project"</li>
              <li>Enter name, description, priority, due date, color</li>
              <li>Click "Create Project"</li>
            </ol>
            <div className="bg-indigo-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-indigo-700 mb-1">Example:</p>
              <p>Name: "Website Redesign" | Priority: High | Due: March 31, 2026</p>
              <p>Description: "Redesign company website for 2026 rebrand"</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Managing Tasks with Kanban Board',
        content: (
          <div className="space-y-2">
            <p>Open a project to see the <strong>Kanban Board</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>To Do:</strong> Tasks waiting to be started</li>
              <li><strong>In Progress:</strong> Currently being worked on</li>
              <li><strong>In Review:</strong> Awaiting review or approval</li>
              <li><strong>Done:</strong> Completed tasks</li>
            </ul>
            <p><strong>Drag and drop</strong> tasks between columns. Also available in <strong>List</strong> view.</p>
            <div className="bg-indigo-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-indigo-700 mb-1">Example Tasks:</p>
              <p>• Design homepage mockup (High, Due: Jan 20)</p>
              <p>• Write product page content (Medium, Due: Jan 25)</p>
              <p>• Set up hosting (Low, Due: Feb 1)</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Task Details & Features',
        content: (
          <div className="space-y-2">
            <p>Click any task to open its detail panel:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Subtasks:</strong> Break into smaller items with checkboxes</li>
              <li><strong>Priority:</strong> Low, Medium, High, or Urgent</li>
              <li><strong>Due Date:</strong> Overdue tasks highlighted in red</li>
              <li><strong>Time Tracking:</strong> Estimated vs actual hours</li>
              <li><strong>Labels:</strong> Color-coded categorization</li>
              <li><strong>Comments:</strong> Team discussion</li>
              <li><strong>Attachments:</strong> Files, images, PDFs</li>
              <li><strong>Activity Log:</strong> Complete change history</li>
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
              <li>Tasks with due dates appear on a calendar timeline</li>
              <li>Bar length = estimated duration</li>
              <li>Identify overlapping tasks and conflicts</li>
              <li>Click any bar to open task details</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Team Collaboration',
        content: (
          <div className="space-y-2">
            <p>Collaborate on projects with your team:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Project Members:</strong> Add team members with Lead, Member, or Viewer roles</li>
              <li><strong>Assignees:</strong> Assign tasks to specific people</li>
              <li><strong>File Attachments:</strong> Attach files directly to tasks</li>
              <li><strong>Activity Feed:</strong> Stay updated on all changes</li>
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
              <li>Go to <strong>Projects &gt; Recurring Tasks</strong></li>
              <li>Set repeat: daily, weekly, monthly, or custom schedule</li>
              <li>Each recurrence auto-creates a new task</li>
              <li>Great for weekly reports, monthly reviews, daily standups</li>
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
              <li><strong>Add Vendor:</strong> Name, contact person, email, phone</li>
              <li><strong>Import CSV:</strong> Bulk import from spreadsheet</li>
              <li>Track outstanding balances per vendor</li>
            </ul>
            <div className="bg-amber-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-amber-700 mb-1">Example Vendors:</p>
              <p>TechHub Nigeria — Emeka Williams — sales@techhub.com</p>
              <p>OfficeMax Supplies — Aisha Bello — orders@officemax.com</p>
            </div>
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
              <li>Select vendor/supplier</li>
              <li>Add products with quantities and unit prices</li>
              <li>Submit for approval</li>
              <li>Receive goods and update inventory</li>
            </ol>
            <div className="bg-amber-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-amber-700 mb-1">Example PO:</p>
              <p>PO-00001 to TechHub Nigeria:</p>
              <p>• Wireless Mouse: 50 x ₦5,000 = ₦250,000</p>
              <p>• USB Cable: 100 x ₦1,200 = ₦120,000</p>
              <p>• Total: ₦370,000</p>
              <p>→ Submit → Approve → Receive Goods → Stock updated</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Goods Receipt',
        content: (
          <div className="space-y-2">
            <p>When goods arrive from a vendor:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to <strong>Procurement &gt; Goods Receipts</strong></li>
              <li>Select the purchase order</li>
              <li>Confirm quantities received</li>
              <li>Add notes (e.g., "2 items damaged")</li>
              <li>Click "Confirm Receipt"</li>
            </ol>
            <p>Inventory is automatically updated with received quantities.</p>
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
              <li>Click <strong>"Add Account"</strong></li>
              <li>Enter a unique code (e.g., 1000, 2000)</li>
              <li>Choose type: Asset, Liability, Equity, Revenue, or Expense</li>
              <li>Toggle active/inactive as needed</li>
            </ol>
            <div className="bg-purple-50 rounded-lg p-3 text-xs font-mono">
              <p className="font-bold text-purple-700 mb-1">Standard Accounts:</p>
              <p>1000 Cash | 1010 Bank | 1020 Receivables | 1100 Inventory</p>
              <p>2000 Payables | 2100 VAT | 3000 Equity</p>
              <p>4000 Sales | 5000 COGS | 5100 Rent | 5200 Salaries</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Creating Journal Entries',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Accounting &gt; General Ledger</strong>:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click <strong>"New Journal Entry"</strong></li>
              <li>Enter description</li>
              <li>Add lines: select account, enter debit or credit</li>
              <li><strong>Debits must equal credits</strong></li>
              <li>Add at least 2 lines per entry</li>
              <li>Click <strong>"Post Entry"</strong></li>
            </ol>
            <div className="bg-purple-50 rounded-lg p-3 text-xs font-mono">
              <p className="font-bold text-purple-700 mb-1">Examples:</p>
              <p>Pay rent: Dr Rent Expense (5100) ₦200K | Cr Cash (1000) ₦200K</p>
              <p>Pay salaries: Dr Salaries (5200) ₦500K | Cr Bank (1010) ₦500K</p>
              <p>Receive payment: Dr Bank (1010) ₦3.17M | Cr Receivables (1020) ₦3.17M</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Trial Balance & Reports',
        content: (
          <div className="space-y-2">
            <p>View your financial data:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>General Ledger:</strong> All journal entries with details</li>
              <li><strong>Trial Balance:</strong> Aggregated balances per account</li>
              <li>Use date filter to view balances as of any date</li>
              <li>Export to CSV for external reporting</li>
            </ul>
            <p><strong>Tip:</strong> Verify debits = credits on Trial Balance. If they don't match, check your journal entries.</p>
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
              <li>Assign a category (Rent, Utilities, Transport, etc.)</li>
              <li>Use category filters to view expenses by type</li>
            </ol>
          </div>
        ),
      },
      {
        title: 'Bank Reconciliation',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Accounting &gt; Bank Reconciliation</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Import Bank Statement:</strong> Upload CSV from your bank</li>
              <li><strong>Auto-Match:</strong> System matches by amount and date</li>
              <li><strong>Manual Match:</strong> Drag unmatched items together</li>
              <li><strong>Bank Rules:</strong> Create rules for recurring categories</li>
              <li><strong>Reconcile:</strong> Verify balances match</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Fiscal Period Management',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Accounting &gt; Fiscal Periods</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Create Periods:</strong> Define fiscal year (e.g., Jan 1 – Dec 31)</li>
              <li><strong>Close Period:</strong> Lock a period to prevent edits</li>
              <li><strong>Reopen Period:</strong> Reopen for corrections (admin only)</li>
              <li>Closed periods ensure historical data integrity</li>
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
            <div className="bg-red-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-red-700 mb-1">Example BOM — Custom Office Desk:</p>
              <p>Wood Planks: 4 @ ₦15,000 = ₦60,000</p>
              <p>Screws Pack: 1 @ ₦2,000 = ₦2,000</p>
              <p>Varnish: 1 @ ₦5,000 = ₦5,000</p>
              <p>Total material cost: ₦67,000 per desk</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Work Orders & Production Tracking',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Production &gt; Work Orders</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Create work orders from BOMs</li>
              <li>Track progress through stages: Cutting → Assembly → Finishing → QC</li>
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
            <p>Go to <strong>HR &gt; Employees</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Add Employee:</strong> Employee code, name, email, department, position, salary</li>
              <li><strong>Employee Codes:</strong> Use EMP-001, EMP-002 format</li>
              <li><strong>Salary:</strong> Set base salary for payroll</li>
              <li><strong>Bank & Tax:</strong> Add bank account and tax ID for payroll</li>
            </ul>
            <div className="bg-pink-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-pink-700 mb-1">Example Employees:</p>
              <p>EMP-001 | Fatima Abubakar | Finance | Senior Accountant | ₦350,000/mo</p>
              <p>EMP-002 | Chidi Okafor | Sales | Sales Executive | ₦250,000/mo</p>
              <p>EMP-003 | Amara Eze | Operations | Assistant | ₦200,000/mo</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Attendance & Time Tracking',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>HR &gt; Attendance</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Quick Clock In/Out:</strong> Use buttons at the top</li>
              <li><strong>Filter by Employee:</strong> Select from dropdown</li>
              <li><strong>Date Range:</strong> View attendance history</li>
              <li><strong>Hours Tracking:</strong> Calculated automatically</li>
            </ul>
            <div className="bg-pink-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-pink-700 mb-1">Example:</p>
              <p>Fatima: Clock in 8:00 AM, Clock out 5:00 PM → 9.0 hours worked</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Leave Management',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>HR &gt; Leave</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Leave Types:</strong> Annual (21 days), Sick (12), Maternity (90), Compassionate (5)</li>
              <li><strong>Request Leave:</strong> Start/end dates and reason</li>
              <li><strong>Approve/Reject:</strong> Managers review with notes</li>
              <li><strong>Leave Balances:</strong> View remaining days per employee</li>
            </ul>
            <div className="bg-pink-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-pink-700 mb-1">Example:</p>
              <p>Fatima requests Annual Leave: Jan 20-22 (3 days)</p>
              <p>Manager approves → Balance: 21 - 3 = 18 days remaining</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Payroll Processing',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>HR &gt; Payroll</strong>:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click <strong>"Process Payroll"</strong></li>
              <li>Set pay period (start and end dates)</li>
              <li>System creates lines for all active employees</li>
              <li>Review, Approve, then Mark as Paid</li>
            </ol>
            <div className="bg-pink-50 rounded-lg p-3 text-xs font-mono">
              <p className="font-bold text-pink-700 mb-1">Example Payroll Run (January 2026):</p>
              <p>Fatima: Gross ₦350K | Tax ₦24.5K | Pension ₦28K | HI ₦5K | Net ₦292.5K</p>
              <p>Chidi: Gross ₦250K | Tax ₦17.5K | Pension ₦20K | HI ₦5K | Net ₦207.5K</p>
              <p>Amara: Gross ₦200K | Tax ₦14K | Pension ₦16K | HI ₦5K | Net ₦165K</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Configurable Deductions',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>HR &gt; Deductions</strong> to set up payroll deductions:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Create Types:</strong> Tax, Pension, Health Insurance, Loan</li>
              <li><strong>Fixed or Percentage:</strong> Set amount or % of gross pay</li>
              <li><strong>Auto-Apply:</strong> Enabled deductions apply during payroll</li>
              <li><strong>Employee-Level:</strong> Override amounts per employee</li>
            </ul>
            <div className="bg-pink-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-pink-700 mb-1">Example Deductions:</p>
              <p>PAYE Tax: 7% of gross</p>
              <p>Pension: 8% of gross</p>
              <p>Health Insurance: ₦5,000/month (fixed)</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Payslips',
        content: (
          <div className="space-y-2">
            <p>Generate and distribute payslips after payroll:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>After approving payroll, click the <strong>download icon</strong></li>
              <li>Professional payslip opens in a new window</li>
              <li>Shows: employee info, gross, deductions breakdown, net pay</li>
              <li>Print or save as PDF</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Expense Claims',
        content: (
          <div className="space-y-2">
            <p>Employees submit out-of-pocket expenses for reimbursement:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Submit:</strong> Category, amount, date, description</li>
              <li><strong>Approval:</strong> Managers approve or reject</li>
              <li><strong>Track Status:</strong> Pending, Approved, Rejected, Paid</li>
            </ul>
            <div className="bg-pink-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-pink-700 mb-1">Example:</p>
              <p>Chidi submits: Transport — ₦15,000 — "Airport taxi for client meeting"</p>
              <p>Manager approves → Moves to "Approved" status</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Employee Onboarding',
        content: (
          <div className="space-y-2">
            <p>Streamline new hire setup:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Go to <strong>HR &gt; Onboarding</strong></li>
              <li>Track progress per employee (documents, equipment, training)</li>
              <li>Mark items as completed</li>
              <li>View completion percentage</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: 'approvals',
    title: 'Approvals & Workflows',
    icon: ClipboardList,
    color: 'bg-orange-100 text-orange-700',
    articles: [
      {
        title: 'Reviewing Pending Approvals',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Approvals</strong> to see all pending items:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Leave requests</strong> from employees</li>
              <li><strong>Expense claims</strong> for reimbursement</li>
              <li><strong>Purchase orders</strong> from procurement</li>
              <li><strong>Credit memos</strong> for returns</li>
              <li><strong>Journal entries</strong> (if enabled)</li>
            </ul>
            <p>Use tabs to filter by type. Click an item to review details.</p>
          </div>
        ),
      },
      {
        title: 'Approving or Rejecting',
        content: (
          <div className="space-y-2">
            <p>Click on a pending item to review:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Review the details (amount, reason, requestor)</li>
              <li>Click <strong>"Approve"</strong> to approve</li>
              <li>Or click <strong>"Reject"</strong> with a comment explaining why</li>
            </ol>
            <div className="bg-orange-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-orange-700 mb-1">Example:</p>
              <p>Fatima requests 3 days Annual Leave (Jan 20-22)</p>
              <p>Manager reviews and clicks "Approve"</p>
              <p>Status changes to "Approved". Leave balance updated.</p>
            </div>
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
            <p>Go to <strong>Settings &gt; Staff</strong>:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Add Staff"</li>
              <li>Enter email, name, role, department</li>
              <li>Staff member receives login credentials</li>
            </ol>
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-gray-700 mb-1">Example:</p>
              <p>Add: chidi@lagostrading.com | Chidi Okafor | Role: Sales Rep | Dept: Sales</p>
              <p>Chidi can now log in and access Sales, POS, and Customers modules only.</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Creating & Customizing Roles',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; Roles</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Click a role to edit module permissions</li>
              <li>Toggle modules on/off</li>
              <li>Set the role's access level</li>
              <li>Changes take effect immediately</li>
            </ul>
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-gray-700 mb-1">Example — Warehouse Manager Role:</p>
              <p>Level: 55 | Modules: Dashboard ✅ Inventory ✅ Products ✅ | Everything else ❌</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Managing Departments',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; Departments</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Create departments: Sales, Finance, Operations, HR</li>
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
            <p>Go to <strong>Settings &gt; Locations</strong>:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Add Location"</li>
              <li>Enter code (LAG-001), name, type, address</li>
              <li>Mark one as default</li>
            </ol>
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-gray-700 mb-1">Example Locations:</p>
              <p>LAG-001 | Lagos Main Store | Store | 15 Broad Street, Lagos Island</p>
              <p>ABJ-001 | Abuja Warehouse | Warehouse | Garki Area 11, Abuja</p>
            </div>
          </div>
        ),
      },
      {
        title: 'Staff Audit Trail',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; Staff Audit</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Activity Feed:</strong> All recent actions across the system</li>
              <li><strong>Audit Trail:</strong> Before/after changes per user</li>
              <li>Filter by user, action type, or date range</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'Billing & Upgrades',
        content: (
          <div className="space-y-2">
            <p>Go to <strong>Settings &gt; Billing</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Compare Plans:</strong> Side-by-side feature comparison</li>
              <li><strong>Upgrade:</strong> Click a plan to upgrade</li>
              <li><strong>Add Modules:</strong> Enable Accounting, HR, Projects, etc.</li>
              <li>Payment via Paystack (card, bank, USSD)</li>
              <li>Annual billing saves 20%</li>
            </ul>
          </div>
        ),
      },
      {
        title: 'WhatsApp Integration',
        content: (
          <div className="space-y-2">
            <p>Send documents to customers via WhatsApp:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Open any invoice, quote, or sales order</li>
              <li>Click the WhatsApp icon</li>
              <li>A chat opens with the customer's number</li>
              <li>Document summary is pre-filled</li>
              <li>Click send</li>
            </ul>
            <p><strong>No API key needed</strong> — uses WhatsApp click-to-chat links.</p>
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

  const handleDownloadTutorial = () => {
    const content = generateTutorial();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CopiaOS_Practice_Tutorial.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

      {/* Download Tutorial Banner */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Download Practice Tutorial</h3>
            <p className="text-sm text-gray-600 mb-3">
              A complete step-by-step guide with exercises for every module. Follow along to set up and practice using CopiaOS.
              Covers: Account setup, Products, Inventory, Sales, POS, Accounting, HR, Payroll, CRM, Projects, Production, Procurement, and more.
            </p>
            <button
              onClick={handleDownloadTutorial}
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Tutorial (TXT)
            </button>
          </div>
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
