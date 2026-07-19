export const TUTORIAL_CONTENT = `# CopiaOS — Complete Practice Tutorial
# For African SMBs (Small & Medium Businesses)
# ================================================
# Version 1.0 — July 2026
#
# This tutorial walks you through EVERY module in CopiaOS.
# Follow each section in order for your first time.
# After completing all sections, you will know how to:
#   - Set up your company and team
#   - Sell products via POS
#   - Manage inventory across locations
#   - Create quotes, invoices, and sales orders
#   - Run your accounting ledger
#   - Manage HR, payroll, and leave
#   - Track deals in CRM
#   - Manage projects and tasks
#   - Run production with BOMs
#   - Handle procurement and vendors
#
# Estimated time: 3–4 hours for full walkthrough
# ================================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: GETTING STARTED (15 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 1.1 — Create Your Account
-----------------------------------
1. Go to https://copia-desktop.vercel.app
2. Click "Sign Up"
3. Fill in:
   - Company Name: "Lagos Trading Co." (or your own company)
   - Your Name: "Adebayo Johnson"
   - Email: your email address
   - Password: choose a strong password
4. Click "Register"
5. You are now logged in as the Managing Director (MD)

RESULT: You land on the Dashboard with full admin access.

EXERCISE 1.2 — Set Up Your Organization
----------------------------------------
1. Go to Settings > General
2. Fill in:
   - Company Name: Lagos Trading Co.
   - Email: info@lagostrading.com
   - Phone: +234 801 234 5678
   - Address: 15 Broad Street, Lagos Island, Lagos
3. Click "Save"

RESULT: Your company name appears on invoices and documents.

EXERCISE 1.3 — Create Your First Location
------------------------------------------
1. Go to Settings > Locations
2. Click "Add Location"
3. Fill in:
   - Code: LAG-001
   - Name: Lagos Main Store
   - Type: Store
   - Address: 15 Broad Street, Lagos Island
   - City: Lagos
   - State: Lagos
   - Country: Nigeria
4. Check "Set as Default"
5. Click "Save"

RESULT: You now have a primary location for inventory and sales.

EXERCISE 1.4 — Create Departments
----------------------------------
1. Go to Settings > Departments
2. Create these departments:
   - Sales (head: assign later)
   - Finance (head: assign later)
   - Operations (head: assign later)
3. Click "Save" after each

RESULT: Departments appear in dropdowns when adding staff.

EXERCISE 1.5 — Create Roles
-----------------------------
1. Go to Settings > Roles
2. You will see default roles: MD, Director, Manager, Accountant, Sales Rep, Staff
3. Create a custom role:
   - Click "Add Role"
   - Name: Warehouse Manager
   - Level: 55
   - Enable modules: Dashboard, Inventory, Products
4. Click "Save"

RESULT: The new role is available when adding staff.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: PRODUCTS & INVENTORY (25 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 2.1 — Add Your First Products
----------------------------------------
1. Go to Products
2. Click "Add Product"
3. Add these products one by one:

   Product A — Laptop Computer
   - SKU: LAP-001
   - Name: Laptop Computer
   - Type: Finished Good
   - UOM: pcs
   - Selling Price: 450,000
   - Cost Price: 350,000
   - Reorder Point: 5
   - Barcode: 1234567890

   Product B — Wireless Mouse
   - SKU: MS-001
   - Name: Wireless Mouse
   - Type: Finished Good
   - UOM: pcs
   - Selling Price: 8,500
   - Cost Price: 5,000
   - Reorder Point: 20

   Product C — Office Chair
   - SKU: CHR-001
   - Name: Office Chair
   - Type: Finished Good
   - UOM: pcs
   - Selling Price: 150,000
   - Cost Price: 95,000
   - Reorder Point: 10

   Product D — Printer Paper A4
   - SKU: PAP-001
   - Name: Printer Paper A4
   - Type: Consumable
   - UOM: pack
   - Selling Price: 3,500
   - Cost Price: 2,000
   - Reorder Point: 50

RESULT: 4 products appear in your product catalog.

EXERCISE 2.2 — Import Products via CSV
----------------------------------------
1. Go to Products
2. Click "Import CSV"
3. Click "Download Template" to get the CSV format
4. Open in Excel/Google Sheets and fill in:
   sku,name,productType,uom,unitPrice,costPrice
   TNR-001,Toner Cartridge,finished_good,pcs,12000,8000
   USB-001,USB Cable,finished_good,pcs,2500,1200
   MRK-001,Whiteboard Marker,consumable,pack,800,400
5. Save as CSV
6. Upload the file
7. Review the preview and confirm

RESULT: 3 more products added (total: 7 products).

EXERCISE 2.3 — Set Up a Warehouse
-----------------------------------
1. Go to Settings > Locations
2. Click "Add Location"
3. Fill in:
   - Code: ABJ-001
   - Name: Abuja Warehouse
   - Type: Warehouse
   - City: Abuja
   - State: FCT
4. Click "Save"

RESULT: You now have 2 locations.

EXERCISE 2.4 — Add Stock to Locations
---------------------------------------
1. Go to Inventory
2. Click on "Laptop Computer"
3. Click "Adjust Stock"
4. Set Location: Lagos Main Store
5. Set Quantity: 15
6. Click "Save"
7. Repeat for Wireless Mouse: 50 units at Lagos Main Store
8. Repeat for Office Chair: 20 units at Lagos Main Store
9. Repeat for Printer Paper A4: 100 packs at Lagos Main Store

RESULT: Stock levels are now visible in the Stock View.

EXERCISE 2.5 — Transfer Stock Between Locations
-------------------------------------------------
1. Go to Inventory > Stock Transfers
2. Click "New Transfer"
3. From: Lagos Main Store
4. To: Abuja Warehouse
5. Add items:
   - Laptop Computer: 3 units
   - Wireless Mouse: 10 units
6. Add note: "Initial stock for Abuja branch"
7. Click "Create Transfer"

RESULT: Stock is deducted from Lagos and added to Abuja.

EXERCISE 2.6 — Check Stock Levels
-----------------------------------
1. Go to Inventory
2. Use the location filter:
   - "All Locations" — shows combined stock
   - "Lagos Main Store" — shows Lagos-only stock
   - "Abuja Warehouse" — shows Abuja-only stock
3. Verify: Lagos has 12 laptops (15 - 3 transferred)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: CUSTOMERS & CRM (20 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 3.1 — Add Customers
------------------------------
1. Go to Customers
2. Click "Add Customer"
3. Add these customers:

   Customer A:
   - Name: Zenith Bank Plc
   - Email: accounts@zenithbank.com
   - Phone: +234 1 234 5678
   - Address: 45 Marina, Lagos Island

   Customer B:
   - Name: MTN Nigeria
   - Email: procurement@mtn.com
   - Phone: +234 803 000 0000
   - Address: 4 Udo Udoma Avenue, Uyo

   Customer C:
   - Name: Dangote Industries
   - Email: purchase@dangote.com
   - Phone: +234 1 888 0000
   - Address: 1 Oba Akran Avenue, Ikeja

RESULT: 3 customers in your database.

EXERCISE 3.2 — Create a CRM Deal
----------------------------------
1. Go to CRM
2. Click "New Deal"
3. Fill in:
   - Deal Name: Zenith Bank — Office Furniture Supply
   - Value: 3,000,000
   - Stage: Lead
   - Assignee: (yourself)
4. Click "Create Deal"
5. Click on the deal to open it
6. Add an activity:
   - Type: Call
   - Note: "Called procurement team. They need 20 office chairs."
   - Date: today
7. Add another activity:
   - Type: Meeting
   - Note: "Scheduled site visit for Friday"
   - Date: next Friday

RESULT: Deal appears in the Lead column of your pipeline.

EXERCISE 3.3 — Move Deal Through Pipeline
-------------------------------------------
1. Drag the deal from "Lead" to "Proposal"
2. Add a note: "Sent proposal for 20 chairs at 150K each"
3. Drag to "Negotiation"
4. Add note: "Client counter-offered at 140K each"
5. When the deal is won, drag to "Won"
6. Click "Convert to Invoice" to create an invoice

RESULT: Deal is tracked through your entire sales process.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4: QUOTES, INVOICES & SALES (25 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 4.1 — Create a Quote
-------------------------------
1. Go to Sales > Quotes
2. Click "New Quote"
3. Select Customer: Zenith Bank Plc
4. Add items:
   - Office Chair (CHR-001): Qty 20, Price 150,000
   - Wireless Mouse (MS-001): Qty 20, Price 8,500
5. Verify subtotal: (20 x 150,000) + (20 x 8,500) = 3,170,000
6. Click "Save"
7. Click the email icon to send to client
8. Choose template: "General"
9. Click "Send"

RESULT: Quote Q-00001 is created and emailed to the client.

EXERCISE 4.2 — Convert Quote to Sales Order
---------------------------------------------
1. Go to Sales > Quotes
2. Find quote Q-00001
3. Click "Convert to Sales Order"
4. Review the order details
5. Set delivery date: next Friday
6. Set shipping address: 45 Marina, Lagos Island
7. Click "Confirm"

RESULT: Sales Order SO-00004 is created from the quote.

EXERCISE 4.3 — Convert Sales Order to Invoice
-----------------------------------------------
1. Go to Sales > Sales Orders
2. Find order SO-00004
3. Click "Convert to Invoice"
4. Review the invoice
5. Click "Save"

RESULT: Invoice INV-00001 is created with line items from the order.

EXERCISE 4.4 — Send Invoice via Email
---------------------------------------
1. Go to Sales > Invoices
2. Find invoice INV-00001
3. Click the email icon
4. Choose template: "Contract"
5. Click "Send"

RESULT: Professional invoice sent to Zenith Bank.

EXERCISE 4.5 — Record Payment on Invoice
------------------------------------------
1. Open invoice INV-00001
2. Click "Record Payment"
3. Amount: 3,170,000
4. Method: Bank Transfer
5. Click "Save"

RESULT: Invoice status changes to "Paid". Receivable is cleared.

EXERCISE 4.6 — Create a Credit Memo (for Returns)
---------------------------------------------------
1. Go to Sales > Invoices
2. Find a paid invoice
3. Click "Create Credit Memo"
4. Reason: "2 chairs returned — damaged in transit"
5. Add item: Office Chair, Qty 2, Price 150,000
6. Click "Submit"

RESULT: Credit memo created. Customer's balance is reduced by 300,000.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5: POINT OF SALE (15 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 5.1 — Make a POS Sale
--------------------------------
1. Go to Point of Sale
2. Click "Open Drawer"
3. Enter opening cash: 10,000
4. Click "Open Session"
5. Search for products:
   - Type "mouse" → click Wireless Mouse
   - Type "paper" → click Printer Paper A4
6. Adjust quantities:
   - Wireless Mouse: 2
   - Printer Paper: 3
7. Verify total: (2 x 8,500) + (3 x 3,500) = 27,500
8. Click "Checkout"
9. Select payment: Cash
10. Amount tendered: 30,000
11. Click "Complete Sale"

RESULT: Sale completed. Change due: 2,500.

EXERCISE 5.2 — Barcode Scanning
---------------------------------
1. In POS, click the barcode scanner icon
2. Point your device camera at a product barcode
3. Product is automatically added to the cart
4. Adjust quantity if needed
5. Complete the sale as above

RESULT: Products added by scanning barcodes.

EXERCISE 5.3 — Split Payment
------------------------------
1. Add items to cart (total: 27,500)
2. Click "Checkout"
3. Select "Split Payment"
4. Cash: 15,000
5. Card: 12,500
6. Click "Complete Sale"

RESULT: Payment split across two methods.

EXERCISE 5.4 — End of Day (Z-Report)
--------------------------------------
1. In POS, click "Close Drawer"
2. Enter your cash count (e.g., 37,500)
3. View the breakdown:
   - Opening: 10,000
   - Sales: 27,500
   - Expected: 37,500
   - Actual: 37,500
   - Variance: 0
4. Click "Close Session"

RESULT: Session closed. Z-Report generated for your records.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6: ACCOUNTING & FINANCE (25 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 6.1 — Set Up Chart of Accounts
-----------------------------------------
1. Go to Accounting > Chart of Accounts
2. You should see default accounts. Add these if missing:

   Code   Name                      Type
   ----   ----                      ----
   1000   Cash                      Asset
   1010   Bank Account              Asset
   1020   Accounts Receivable       Asset
   1100   Inventory                 Asset
   2000   Accounts Payable          Liability
   2100   VAT Payable               Liability
   3000   Owner's Equity            Equity
   4000   Sales Revenue             Revenue
   4100   Service Revenue           Revenue
   5000   Cost of Goods Sold        Expense
   5100   Rent Expense              Expense
   5200   Salaries Expense          Expense
   5300   Utilities Expense         Expense
   5400   Office Supplies Expense   Expense

3. Click "Add Account" for each missing account

RESULT: Complete chart of accounts ready for journal entries.

EXERCISE 6.2 — Create a Journal Entry
---------------------------------------
1. Go to Accounting > General Ledger
2. Click "New Journal Entry"
3. Description: "Office rent payment for January"
4. Add lines:
   - Account: Rent Expense (5100), Debit: 200,000
   - Account: Cash (1000), Credit: 200,000
5. Verify: Debits = Credits = 200,000
6. Click "Post Entry"

RESULT: Journal entry posted. Rent expense recorded.

EXERCISE 6.3 — More Journal Entries (Practice)
-------------------------------------------------
Create these journal entries:

Entry 1 — Pay salaries
   Debit: Salaries Expense (5200) — 500,000
   Credit: Bank Account (1010) — 500,000

Entry 2 — Pay electricity bill
   Debit: Utilities Expense (5300) — 35,000
   Credit: Cash (1000) — 35,000

Entry 3 — Receive payment from customer
   Debit: Bank Account (1010) — 3,170,000
   Credit: Accounts Receivable (1020) — 3,170,000

Entry 4 — Purchase office supplies
   Debit: Office Supplies Expense (5400) — 15,000
   Credit: Cash (1000) — 15,000

RESULT: Multiple journal entries in your general ledger.

EXERCISE 6.4 — View Trial Balance
-----------------------------------
1. Go to Accounting > Trial Balance
2. Review all accounts and their balances
3. Verify: Total Debits = Total Credits
4. Use the date filter to view balances at any date
5. Click "Export CSV" to download

RESULT: Trial balance confirms your books are balanced.

EXERCISE 6.5 — Bank Reconciliation
------------------------------------
1. Go to Accounting > Bank Reconciliation
2. Import a bank statement CSV (or use test data)
3. Match transactions:
   - System auto-matches by amount and date
   - Drag unmatched items together for manual match
4. Create bank rules for recurring categories
5. Click "Reconcile" when all items are matched

RESULT: Bank balance matches your accounting records.

EXERCISE 6.6 — Fiscal Period Management
-----------------------------------------
1. Go to Accounting > Fiscal Periods
2. Create a fiscal period:
   - Start: January 1, 2026
   - End: December 31, 2026
3. At end of month, click "Close Period" for January
4. This locks all January journal entries from edits

RESULT: Financial data integrity maintained by period locking.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7: HR & PAYROLL (25 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 7.1 — Add Employees
------------------------------
1. Go to HR > Employees
2. Click "Add Employee"
3. Add these employees:

   Employee A:
   - Code: EMP-001
   - Full Name: Fatima Abubakar
   - Email: fatima@lagostrading.com
   - Department: Finance
   - Position: Senior Accountant
   - Salary: 350,000
   - Hire Date: March 15, 2025

   Employee B:
   - Code: EMP-002
   - Full Name: Chidi Okafor
   - Email: chidi@lagostrading.com
   - Department: Sales
   - Position: Sales Executive
   - Salary: 250,000
   - Hire Date: June 1, 2025

   Employee C:
   - Code: EMP-003
   - Full Name: Amara Eze
   - Email: amara@lagostrading.com
   - Department: Operations
   - Position: Operations Assistant
   - Salary: 200,000
   - Hire Date: September 10, 2025

RESULT: 3 employees in your HR system.

EXERCISE 7.2 — Track Attendance
---------------------------------
1. Go to HR > Attendance
2. Click "Clock In" for Fatima Abubakar
3. Set time: 8:00 AM
4. Later, click "Clock Out"
5. Set time: 5:00 PM
6. View the attendance log:
   - Date: today
   - Clock In: 8:00 AM
   - Clock Out: 5:00 PM
   - Hours: 9.0

RESULT: Attendance tracked for the employee.

EXERCISE 7.3 — Create Leave Types
-----------------------------------
1. Go to HR > Leave
2. Create these leave types:
   - Annual Leave: 21 days/year
   - Sick Leave: 12 days/year
   - Maternity Leave: 90 days/year
   - Compassionate Leave: 5 days/year

RESULT: Leave types available for employee requests.

EXERCISE 7.4 — Request & Approve Leave
----------------------------------------
1. As an employee, go to HR > Leave
2. Click "Request Leave"
3. Type: Annual Leave
4. Start: next Monday
5. End: next Wednesday (3 days)
6. Reason: "Family vacation"
7. Click "Submit"
8. As manager, go to Approvals
9. Find the leave request
10. Click "Approve"

RESULT: Leave approved. Balance reduced by 3 days.

EXERCISE 7.5 — Set Up Deductions
----------------------------------
1. Go to HR > Deductions
2. Create deductions:
   - PAYE Tax: Percentage, 7%
   - Pension: Percentage, 8%
   - Health Insurance: Fixed, 5,000/month

RESULT: Deductions ready for payroll processing.

EXERCISE 7.6 — Process Payroll
--------------------------------
1. Go to HR > Payroll
2. Click "Process Payroll"
3. Set period: January 1–31, 2026
4. Review payroll lines:
   - Fatima: Gross 350,000, Tax 24,500, Pension 28,000, HI 5,000, Net 292,500
   - Chidi: Gross 250,000, Tax 17,500, Pension 20,000, HI 5,000, Net 207,500
   - Amara: Gross 200,000, Tax 14,000, Pension 16,000, HI 5,000, Net 165,000
5. Click "Approve"
6. Click "Mark as Paid"

RESULT: Payroll processed. Payslips generated.

EXERCISE 7.7 — Generate Payslips
----------------------------------
1. After approving payroll, find a payroll line
2. Click the download icon
3. A payslip opens in a new window showing:
   - Employee name and code
   - Pay period
   - Gross pay
   - Each deduction broken down
   - Net pay
4. Print or save as PDF

RESULT: Professional payslips ready for distribution.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8: EXPENSE CLAIMS (10 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 8.1 — Submit an Expense Claim
----------------------------------------
1. Go to HR > Expense Claims
2. Click "Submit Claim"
3. Fill in:
   - Category: Transport
   - Amount: 15,000
   - Date: today
   - Description: "Airport taxi to Ikeja for client meeting"
4. Click "Submit"

RESULT: Claim is pending manager approval.

EXERCISE 8.2 — Approve/Reject Claims
--------------------------------------
1. Go to Approvals
2. Find the expense claim
3. Click "Approve" or "Reject" with a note
4. If approved, the claim moves to "Approved" status

RESULT: Expense claim processed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 9: PROCUREMENT & VENDORS (15 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 9.1 — Add Vendors
-----------------------------
1. Go to Vendors
2. Click "Add Vendor"
3. Add these vendors:

   Vendor A:
   - Name: TechHub Nigeria
   - Contact: Emeka Williams
   - Email: sales@techhub.com
   - Phone: +234 802 345 6789

   Vendor B:
   - Name: OfficeMax Supplies
   - Contact: Aisha Bello
   - Email: orders@officemax.com
   - Phone: +234 803 456 7890

RESULT: 2 vendors in your procurement system.

EXERCISE 9.2 — Create Purchase Order
--------------------------------------
1. Go to Procurement > Purchase Orders
2. Click "New Purchase Order"
3. Select Vendor: TechHub Nigeria
4. Add items:
   - Wireless Mouse (MS-001): Qty 50, Price 5,000
   - USB Cable (USB-001): Qty 100, Price 1,200
5. Total: (50 x 5,000) + (100 x 1,200) = 370,000
6. Click "Submit for Approval"

RESULT: PO-00001 created, pending approval.

EXERCISE 9.3 — Approve & Receive Goods
-----------------------------------------
1. Go to Approvals
2. Find the purchase order
3. Click "Approve"
4. Go to Procurement > Purchase Orders
5. Find PO-00001
6. Click "Receive Goods"
7. Confirm quantities received
8. Click "Confirm Receipt"

RESULT: Inventory updated. Stock levels increased.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 10: PROJECTS & TASKS (20 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 10.1 — Create a Project
----------------------------------
1. Go to Projects
2. Click "New Project"
3. Fill in:
   - Name: Website Redesign
   - Description: "Redesign company website for 2026 rebrand"
   - Priority: High
   - Due Date: March 31, 2026
   - Color: Indigo
4. Click "Create Project"

RESULT: Project created with Kanban board.

EXERCISE 10.2 — Add Tasks to Project
--------------------------------------
1. Open the "Website Redesign" project
2. In the "To Do" column, click "+ Add Task"
3. Add these tasks:
   - Task 1: "Design homepage mockup" (Priority: High, Due: Jan 20)
   - Task 2: "Write product page content" (Priority: Medium, Due: Jan 25)
   - Task 3: "Set up hosting and domain" (Priority: Low, Due: Feb 1)
   - Task 4: "Test on mobile devices" (Priority: High, Due: Mar 15)

RESULT: 4 tasks in the To Do column.

EXERCISE 10.3 — Use Kanban Board
----------------------------------
1. Drag "Design homepage mockup" to "In Progress"
2. Add a subtask: "Create wireframes"
3. Add a comment: "Working on the hero section"
4. Drag to "In Review" when done
5. Review and drag to "Done"

RESULT: Task moves through the workflow.

EXERCISE 10.4 — Track Time
-----------------------------
1. Open a task in "In Progress"
2. Click "Time Tracking"
3. Estimated: 8 hours
4. Actual: 6 hours (as you work)
5. The time tracking bar shows progress

RESULT: Time tracked against the task.

EXERCISE 10.5 — Timeline/Gantt View
--------------------------------------
1. Click the "Timeline" tab
2. See tasks as horizontal bars on a calendar
3. Identify overlapping tasks
4. Click any bar to open task details

RESULT: Visual timeline of your project schedule.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 11: PRODUCTION & BOM (15 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 11.1 — Create a Bill of Materials (BOM)
--------------------------------------------------
1. Go to Production > BOMs
2. Click "New BOM"
3. Fill in:
   - Name: Custom Office Desk
   - Finished Good: (create a product "Office Desk" first)
   - Quantity to Produce: 1
4. Add raw materials:
   - Wood Planks: Qty 4, Unit Cost 15,000
   - Screws Pack: Qty 1, Unit Cost 2,000
   - Varnish: Qty 1, Unit Cost 5,000
5. Total Material Cost: 67,000
6. Click "Save"

RESULT: BOM defines how to make one Office Desk.

EXERCISE 11.2 — Create Work Order
-----------------------------------
1. Go to Production > Work Orders
2. Click "New Work Order"
3. Select BOM: Custom Office Desk
4. Quantity: 5
5. Click "Create"
6. Track progress through stages:
   - Cutting → Assembly → Finishing → Quality Check
7. Mark each stage complete as work progresses

RESULT: Work order tracks production of 5 desks.

EXERCISE 11.3 — Complete Production
--------------------------------------
1. Mark the final stage as complete
2. System automatically:
   - Deducts raw materials from inventory
   - Adds 5 Office Desks to finished goods inventory
3. Check Inventory to verify

RESULT: Raw materials consumed, finished goods produced.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 12: APPROVALS & WORKFLOWS (10 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 12.1 — View Pending Approvals
-----------------------------------------
1. Go to Approvals
2. View all pending items:
   - Leave requests
   - Expense claims
   - Purchase orders
   - Credit memos
   - Journal entries
3. Use tabs to filter by type

RESULT: Centralized approval queue.

EXERCISE 12.2 — Approve/Reject Items
---------------------------------------
1. Click on a pending item
2. Review details
3. Click "Approve" or "Reject"
4. Add a comment explaining your decision

RESULT: Item processed. Status updated.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 13: REPORTS & ANALYTICS (10 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 13.1 — View Dashboard
---------------------------------
1. Go to Dashboard
2. Review your KPIs:
   - Revenue (Month)
   - Net Profit
   - Cash Collected
   - Pending Approvals
   - Low Stock Alerts
   - Active Orders
   - Outstanding Invoices
3. View Top Products This Month

RESULT: Executive overview of your business.

EXERCISE 13.2 — Run Reports
------------------------------
1. Go to Reports
2. Available reports:
   - Sales Report: revenue trends, top products
   - Inventory Report: stock levels, movements
   - Financial Report: profit & loss, expenses
3. Filter by date range
4. Export to CSV for external use

RESULT: Data-driven business insights.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 14: STAFF & ROLE MANAGEMENT (10 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 14.1 — Add Staff Members
------------------------------------
1. Go to Settings > Staff
2. Click "Add Staff"
3. Add:
   - Email: chidi@lagostrading.com
   - Name: Chidi Okafor
   - Role: Sales Rep
   - Department: Sales
4. Click "Save"
5. The staff member can now log in with their email

RESULT: New staff member created with Sales Rep access.

EXERCISE 14.2 — Customize Role Permissions
---------------------------------------------
1. Go to Settings > Roles
2. Click on "Sales Rep" role
3. Toggle modules:
   - Dashboard: ON
   - Sales: ON
   - POS: ON
   - Customers: ON
   - Inventory: ON (view only)
   - Accounting: OFF
   - HR: OFF
   - Settings: OFF
4. Click "Save"

RESULT: Sales Reps can only access sales-related modules.

EXERCISE 14.3 — Staff Audit Trail
-----------------------------------
1. Go to Settings > Staff Audit
2. View the activity feed
3. Filter by user or action type
4. Click on an entry to see before/after changes

RESULT: Complete audit trail of all user actions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 15: BILLING & SUBSCRIPTIONS (5 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 15.1 — Check Your Plan
---------------------------------
1. Go to Settings > Billing
2. View your current plan and active modules
3. Click "Compare Plans" to see all options

RESULT: You know what features you have access to.

EXERCISE 15.2 — Upgrade Your Plan
-----------------------------------
1. Go to Settings > Billing > Compare Plans
2. Select a higher plan or add modules
3. Click "Upgrade"
4. Complete payment via Paystack (card, bank, USSD)

RESULT: New features unlocked immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 16: WHATSAPP INTEGRATION (5 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXERCISE 16.1 — Send Documents via WhatsApp
---------------------------------------------
1. Open any invoice, quote, or sales order
2. Click the WhatsApp icon
3. A chat opens on wa.me with the customer's number
4. The document summary is pre-filled
5. Click send

RESULT: Customer receives document link via WhatsApp.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK REFERENCE — KEYBOARD SHORTCUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Dashboard ........... /home
  POS ................. /pos
  Products ............ /products
  Sales Orders ........ /sales-orders
  Invoices ............ /invoices
  Customers ........... /customers
  Inventory ........... /inventory
  Accounting .......... /accounting
  HR .................. /hr
  Projects ............ /projects
  CRM ................. /crm
  Help ................ /help
  Settings ............ /settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q: "I can't see a module in the sidebar"
A: Go to Settings > Roles. Ensure your role has that module enabled.

Q: "I get 'Access Denied' when clicking a page"
A: Your role level may be too low. Ask your admin to increase your level.

Q: "Products don't show in POS"
A: Check that products are marked "Active" and have stock at the current location.

Q: "Dashboard shows zeros"
A: Ensure you have data (products, orders, customers) and the correct location is selected.

Q: "I can't create journal entries"
A: Ensure the Accounting module is enabled on your plan and your role has access.

Q: "Payroll shows wrong amounts"
A: Check employee salaries and deduction configurations in HR > Deductions.

Q: "Stock transfer failed"
A: Ensure source and destination locations are different and both have the product.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF TUTORIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Congratulations! You have completed the CopiaOS tutorial.

For more help, visit the Help page in the app or contact support.

CopiaOS — Built for African businesses.
`;
