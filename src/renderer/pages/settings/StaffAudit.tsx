import { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import { Activity, Search, Filter, Clock, User, FileText, ChevronLeft, ChevronRight, RefreshCw, Download, Shield, ShoppingCart, CreditCard, Package, Users, Trash2, Edit3, PlusCircle, Eye } from 'lucide-react';

interface ActivityItem {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: any;
  created_at: string;
}

interface AuditLogItem {
  id: string;
  tenant_id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  operation: string;
  before_state: any;
  after_state: any;
  request_id: string;
  ip_address: string;
  created_at: string;
}

interface StaffOption {
  id: string;
  full_name: string;
  email: string;
}

const ACTION_ICONS: Record<string, any> = {
  'sale.created': ShoppingCart,
  'sale.completed': ShoppingCart,
  'payment.received': CreditCard,
  'invoice.created': FileText,
  'invoice.issued': FileText,
  'product.created': Package,
  'product.updated': Edit3,
  'customer.created': Users,
  'customer.updated': Edit3,
  'customer.deleted': Trash2,
  'vendor.created': Users,
  'vendor.updated': Edit3,
  'vendor.deleted': Trash2,
  'expense.created': CreditCard,
  'role.created': Shield,
  'role.updated': Shield,
  'role.deleted': Shield,
  'staff.created': User,
  'staff.updated': User,
  'staff.deleted': User,
  'user.invited': User,
  'user.joined': User,
};

const ACTION_COLORS: Record<string, string> = {
  'created': 'bg-green-100 text-green-700',
  'updated': 'bg-blue-100 text-blue-700',
  'deleted': 'bg-red-100 text-red-700',
};

const OPERATION_COLORS: Record<string, string> = {
  'INSERT': 'bg-green-100 text-green-700',
  'UPDATE': 'bg-blue-100 text-blue-700',
  'DELETE': 'bg-red-100 text-red-700',
};

function formatAction(action: string): string {
  return action.replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ActionIcon({ action }: { action: string }) {
  const Icon = ACTION_ICONS[action] || Activity;
  return <Icon className="w-4 h-4 text-gray-500" />;
}

function ActionBadge({ action }: { action: string }) {
  const parts = action.split('.');
  const verb = parts[parts.length - 1];
  const colorClass = ACTION_COLORS[verb] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {verb.toUpperCase()}
    </span>
  );
}

function OperationBadge({ operation }: { operation: string }) {
  const colorClass = OPERATION_COLORS[operation] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {operation}
    </span>
  );
}

export function StaffAudit() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [activeTab, setActiveTab] = useState<'activity' | 'audit'>('activity');

  // Activity state
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);

  // Audit state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Filters
  const [filterUserId, setFilterUserId] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [filterOperation, setFilterOperation] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [staffList, setStaffList] = useState<StaffOption[]>([]);

  // Load staff list for user filter dropdown
  useEffect(() => {
    api.get('/staff').then(({ data }) => {
      const list = Array.isArray(data) ? data : [];
      setStaffList(list.map((s: any) => ({
        id: s.user_id || s.userId,
        full_name: s.full_name || s.fullName || s.job_title,
        email: s.email,
      })).filter((s: any) => s.id));
    }).catch(() => {});
  }, []);

  const loadActivities = useCallback(async (page = 1) => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterUserId) params.set('userId', filterUserId);
      if (filterAction) params.set('action', filterAction);
      if (filterFrom) params.set('from', filterFrom);
      if (filterTo) params.set('to', filterTo);
      const { data } = await api.get(`/activity?${params.toString()}`);
      setActivities(data.data || []);
      setActivityTotal(data.total || 0);
      setActivityPage(data.page || 1);
    } catch {
    } finally {
      setActivityLoading(false);
    }
  }, [filterUserId, filterAction, filterFrom, filterTo]);

  const loadAuditLogs = useCallback(async (page = 1) => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterUserId) params.set('userId', filterUserId);
      if (filterTable) params.set('tableName', filterTable);
      if (filterOperation) params.set('operation', filterOperation);
      if (filterFrom) params.set('from', filterFrom);
      if (filterTo) params.set('to', filterTo);
      const { data } = await api.get(`/audit?${params.toString()}`);
      setAuditLogs(data.rows || []);
      setAuditTotal(data.total || 0);
      setAuditPage(data.page || 1);
    } catch {
    } finally {
      setAuditLoading(false);
    }
  }, [filterUserId, filterTable, filterOperation, filterFrom, filterTo]);

  useEffect(() => {
    if (activeTab === 'activity') loadActivities(1);
    else loadAuditLogs(1);
  }, [activeTab, loadActivities, loadAuditLogs]);

  const handleFilterApply = () => {
    if (activeTab === 'activity') loadActivities(1);
    else loadAuditLogs(1);
  };

  const activityTotalPages = Math.ceil(activityTotal / 20);
  const auditTotalPages = Math.ceil(auditTotal / 20);

  const tables = ['users', 'tenants', 'products', 'customers', 'vendors', 'sales_orders', 'invoices', 'expenses', 'roles', 'staff', 'warehouses', 'inventory_movements'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Audit</h1>
          <p className="text-gray-500 mt-1">Track all user activities and system changes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity Feed
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{activityTotal}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Audit Trail
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{auditTotal}</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* User filter */}
          <select
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Users</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
            ))}
          </select>

          {/* Action filter (activity only) */}
          {activeTab === 'activity' && (
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Actions</option>
              <option value="sale.created">Sale Created</option>
              <option value="product.created">Product Created</option>
              <option value="customer.created">Customer Created</option>
              <option value="customer.updated">Customer Updated</option>
              <option value="customer.deleted">Customer Deleted</option>
              <option value="vendor.created">Vendor Created</option>
              <option value="vendor.updated">Vendor Updated</option>
              <option value="vendor.deleted">Vendor Deleted</option>
              <option value="expense.created">Expense Created</option>
              <option value="role.created">Role Created</option>
              <option value="role.updated">Role Updated</option>
              <option value="role.deleted">Role Deleted</option>
              <option value="staff.created">Staff Created</option>
              <option value="staff.updated">Staff Updated</option>
              <option value="staff.deleted">Staff Deleted</option>
            </select>
          )}

          {/* Table filter (audit only) */}
          {activeTab === 'audit' && (
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Tables</option>
              {tables.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          {/* Operation filter (audit only) */}
          {activeTab === 'audit' && (
            <select
              value={filterOperation}
              onChange={(e) => setFilterOperation(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Operations</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          )}

          {/* Date filters */}
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="From date"
          />
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="To date"
          />
          <button
            onClick={handleFilterApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Activity Feed Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {activityLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No activity found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <ActionIcon action={a.action} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">{a.user_name || 'System'}</span>
                      <ActionBadge action={a.action} />
                      <span className="text-sm text-gray-600">{formatAction(a.action)}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {a.entity_type && <span className="capitalize">{a.entity_type.replace(/_/g, ' ')}</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(a.created_at)}
                      </span>
                    </div>
                    {a.metadata && Object.keys(a.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(a.metadata).slice(0, 4).map(([key, val]) => (
                          <span key={key} className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {key}: {String(val)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Pagination */}
          {activityTotalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Page {activityPage} of {activityTotalPages} ({activityTotal} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadActivities(activityPage - 1)}
                  disabled={activityPage <= 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => loadActivities(activityPage + 1)}
                  disabled={activityPage >= activityTotalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Audit log list */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${selectedLog ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            {auditLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No audit logs found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                    className={`w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors ${selectedLog?.id === log.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <OperationBadge operation={log.operation} />
                      <span className="font-medium text-sm text-gray-900">{log.table_name}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(log.created_at)}
                      </span>
                      {log.user_id && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.user_id.slice(0, 8)}...</span>}
                      {log.ip_address && <span>IP: {log.ip_address}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {/* Pagination */}
            {auditTotalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  Page {auditPage} of {auditTotalPages} ({auditTotal} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadAuditLogs(auditPage - 1)}
                    disabled={auditPage <= 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => loadAuditLogs(auditPage + 1)}
                    disabled={auditPage >= auditTotalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedLog && (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Change Details</h3>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                  <span className="text-sm">Close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Table</span>
                  <p className="text-sm font-medium text-gray-900">{selectedLog.table_name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Operation</span>
                  <p><OperationBadge operation={selectedLog.operation} /></p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Record ID</span>
                  <p className="text-sm font-mono text-gray-900 truncate">{selectedLog.record_id || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Timestamp</span>
                  <p className="text-sm text-gray-900">{formatTime(selectedLog.created_at)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">User ID</span>
                  <p className="text-sm font-mono text-gray-900 truncate">{selectedLog.user_id || 'System'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">IP Address</span>
                  <p className="text-sm text-gray-900">{selectedLog.ip_address || 'N/A'}</p>
                </div>
              </div>

              {/* Before/After state diff */}
              <div className="space-y-4">
                {selectedLog.operation === 'INSERT' && selectedLog.after_state && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-green-600" /> New Record
                    </h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.after_state, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedLog.operation === 'UPDATE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-red-600" /> Before
                      </h4>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.before_state, null, 2)}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-600" /> After
                      </h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.after_state, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {selectedLog.operation === 'DELETE' && selectedLog.before_state && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-600" /> Deleted Record
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.before_state, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
