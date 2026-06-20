import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { Upload, CheckCircle, XCircle, Search, Play, Square, RefreshCw, FileText, Plus, Filter, Download, ArrowRight, AlertTriangle } from 'lucide-react';

interface Account {
  id: string;
  code: string;
  name: string;
}

interface ReconciliationSession {
  id: string;
  account_id: string;
  account_name?: string;
  account_code?: string;
  statement_date: string;
  opening_balance: number;
  closing_balance: number;
  status: 'in_progress' | 'completed' | 'reopened';
  created_at: string;
}

interface BankTransaction {
  id: string;
  session_id: string;
  date: string;
  description: string;
  reference?: string;
  amount: number;
  type: string;
  status: 'unmatched' | 'matched' | 'reconciled';
  journal_entry_id?: string;
  journal_entry_number?: string;
  matched_amount?: number;
}

interface BookTransaction {
  id: string;
  journal_number: string;
  entry_date: string;
  description: string;
  reference?: string;
  amount: number;
  status: string;
}

interface BankRule {
  id: string;
  name: string;
  match_field: string;
  match_type: string;
  match_value: string;
  target_account_id: string;
  target_account_name?: string;
  priority: number;
  is_active: boolean;
}

interface ReconciliationReport {
  session: ReconciliationSession;
  total_transactions: number;
  matched_count: number;
  matched_amount: number;
  unmatched_count: number;
  unmatched_amount: number;
  reconciled_count: number;
  reconciled_amount: number;
  unreconciled_items: BankTransaction[];
}

const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function BankReconciliation() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'matching' | 'rules' | 'report'>('sessions');
  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ReconciliationSession | null>(null);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [bookTransactions, setBookTransactions] = useState<BookTransaction[]>([]);
  const [rules, setRules] = useState<BankRule[]>([]);
  const [filter, setFilter] = useState<'all' | 'unmatched' | 'matched' | 'reconciled'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchTarget, setMatchTarget] = useState<BankTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookTransaction[]>([]);
  const [newSessionForm, setNewSessionForm] = useState({ accountId: '', statementDate: '', openingBalance: '', closingBalance: '' });
  const [newRuleForm, setNewRuleForm] = useState({ name: '', match_field: 'description', match_type: 'contains', match_value: '', target_account_id: '', priority: 1 });
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { key: 'sessions' as const, label: 'Sessions' },
    { key: 'matching' as const, label: 'Matching' },
    { key: 'rules' as const, label: 'Rules' },
    { key: 'report' as const, label: 'Report' },
  ];

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/bank-reconciliation/sessions');
      setSessions(res.data?.data || res.data || []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      const res = await api.get('/accounting/accounts');
      setAccounts(res.data?.data || res.data || []);
    } catch { /* */ }
  }, []);

  const loadSessionDetail = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/bank-reconciliation/sessions/${sessionId}`);
      setCurrentSession(res.data?.data || res.data);
    } catch {
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async (sessionId: string) => {
    try {
      const res = await api.get(`/bank-reconciliation/sessions/${sessionId}/transactions`);
      setTransactions(res.data?.data || res.data || []);
    } catch {
      setTransactions([]);
    }
  }, []);

  const loadBookTransactions = useCallback(async (sessionId: string) => {
    try {
      const res = await api.get(`/bank-reconciliation/sessions/${sessionId}/book-transactions`);
      setBookTransactions(res.data?.data || res.data || []);
    } catch {
      setBookTransactions([]);
    }
  }, []);

  const loadRules = useCallback(async () => {
    try {
      const res = await api.get('/bank-reconciliation/rules');
      setRules(res.data?.data || res.data || []);
    } catch {
      setRules([]);
    }
  }, []);

  const loadReport = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/bank-reconciliation/sessions/${sessionId}/report`);
      setReport(res.data?.data || res.data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    loadAccounts();
  }, [loadSessions, loadAccounts]);

  useEffect(() => {
    if (currentSession) {
      loadTransactions(currentSession.id);
      loadBookTransactions(currentSession.id);
    }
  }, [currentSession, loadTransactions, loadBookTransactions]);

  useEffect(() => {
    if (activeTab === 'rules') loadRules();
    if (activeTab === 'report' && currentSession) loadReport(currentSession.id);
  }, [activeTab, currentSession, loadRules, loadReport]);

  const enterSession = (session: ReconciliationSession) => {
    setCurrentSession(session);
    setActiveTab('matching');
    setSelectedIds(new Set());
    setFilter('all');
  };

  const backToSessions = () => {
    setCurrentSession(null);
    setActiveTab('sessions');
    setTransactions([]);
    setBookTransactions([]);
    setReport(null);
    setSelectedIds(new Set());
  };

  const handleCreateSession = async () => {
    try {
      if (!newSessionForm.accountId || !newSessionForm.statementDate) {
        toast.error('Account and statement date are required');
        return;
      }
      await api.post('/bank-reconciliation/sessions', {
        account_id: newSessionForm.accountId,
        statement_date: newSessionForm.statementDate,
        opening_balance: parseFloat(newSessionForm.openingBalance) || 0,
        closing_balance: parseFloat(newSessionForm.closingBalance) || 0,
      });
      toast.success('Session created');
      setShowNewSessionModal(false);
      setNewSessionForm({ accountId: '', statementDate: '', openingBalance: '', closingBalance: '' });
      loadSessions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create session');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSession) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error('CSV must have a header row and at least one data row');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const dateIdx = headers.findIndex((h) => h === 'date');
      const descIdx = headers.findIndex((h) => h === 'description');
      const refIdx = headers.findIndex((h) => h === 'reference');
      const amountIdx = headers.findIndex((h) => h === 'amount');
      const typeIdx = headers.findIndex((h) => h === 'type');
      if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
        toast.error('CSV must have date, description, and amount columns');
        return;
      }
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(',').map((c) => c.trim());
        return {
          date: cols[dateIdx],
          description: cols[descIdx],
          reference: refIdx !== -1 ? cols[refIdx] : '',
          amount: parseFloat(cols[amountIdx]) || 0,
          type: typeIdx !== -1 ? cols[typeIdx] : '',
        };
      });
      await api.post(`/bank-reconciliation/sessions/${currentSession.id}/import`, { transactions: rows });
      toast.success(`Imported ${rows.length} transactions`);
      loadTransactions(currentSession.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to import');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAutoMatch = async () => {
    if (!currentSession) return;
    setProcessing(true);
    try {
      const res = await api.post(`/bank-reconciliation/sessions/${currentSession.id}/auto-match`);
      toast.success(res.data?.message || 'Auto-match completed');
      loadTransactions(currentSession.id);
      loadBookTransactions(currentSession.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Auto-match failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkReconcile = async () => {
    if (!currentSession || selectedIds.size === 0) return;
    setProcessing(true);
    try {
      await api.post(`/bank-reconciliation/sessions/${currentSession.id}/reconcile`, {
        transaction_ids: Array.from(selectedIds),
      });
      toast.success(`Reconciled ${selectedIds.size} transaction(s)`);
      setSelectedIds(new Set());
      loadTransactions(currentSession.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reconcile');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkUnreconcile = async () => {
    if (!currentSession || selectedIds.size === 0) return;
    setProcessing(true);
    try {
      await api.post(`/bank-reconciliation/sessions/${currentSession.id}/unreconcile`, {
        transaction_ids: Array.from(selectedIds),
      });
      toast.success(`Unreconciled ${selectedIds.size} transaction(s)`);
      setSelectedIds(new Set());
      loadTransactions(currentSession.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to unreconcile');
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseSession = async () => {
    if (!currentSession) return;
    setProcessing(true);
    try {
      await api.patch(`/bank-reconciliation/sessions/${currentSession.id}/close`);
      toast.success('Session closed');
      loadSessionDetail(currentSession.id);
      loadSessions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to close session');
    } finally {
      setProcessing(false);
    }
  };

  const handleReopenSession = async () => {
    if (!currentSession) return;
    setProcessing(true);
    try {
      await api.patch(`/bank-reconciliation/sessions/${currentSession.id}/reopen`);
      toast.success('Session reopened');
      loadSessionDetail(currentSession.id);
      loadSessions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reopen session');
    } finally {
      setProcessing(false);
    }
  };

  const openMatchModal = (tx: BankTransaction) => {
    setMatchTarget(tx);
    setShowMatchModal(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const searchBookEntries = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim() || !currentSession) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/bank-reconciliation/sessions/${currentSession.id}/book-transactions`, { params: { search: q } });
      setSearchResults(res.data?.data || res.data || []);
    } catch {
      setSearchResults([]);
    }
  };

  const handleMatch = async (bookTxId: string) => {
    if (!currentSession || !matchTarget) return;
    try {
      await api.post(`/bank-reconciliation/sessions/${currentSession.id}/match`, {
        bank_transaction_id: matchTarget.id,
        journal_entry_id: bookTxId,
      });
      toast.success('Matched successfully');
      setShowMatchModal(false);
      setMatchTarget(null);
      loadTransactions(currentSession.id);
      loadBookTransactions(currentSession.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to match');
    }
  };

  const handleCreateRule = async () => {
    try {
      if (!newRuleForm.name || !newRuleForm.match_value || !newRuleForm.target_account_id) {
        toast.error('Name, match value, and target account are required');
        return;
      }
      await api.post('/bank-reconciliation/rules', newRuleForm);
      toast.success('Rule created');
      setShowNewRuleModal(false);
      setNewRuleForm({ name: '', match_field: 'description', match_type: 'contains', match_value: '', target_account_id: '', priority: 1 });
      loadRules();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create rule');
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await api.delete(`/bank-reconciliation/rules/${id}`);
      toast.success('Rule deleted');
      loadRules();
    } catch {
      toast.error('Failed to delete rule');
    }
  };

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/bank-reconciliation/rules/${id}`, { is_active: !isActive });
      loadRules();
    } catch {
      toast.error('Failed to update rule');
    }
  };

  const handleApplyRules = async () => {
    if (!currentSession) return;
    setProcessing(true);
    try {
      const res = await api.post(`/bank-reconciliation/sessions/${currentSession.id}/apply-rules`);
      toast.success(res.data?.message || 'Rules applied');
      loadTransactions(currentSession.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to apply rules');
    } finally {
      setProcessing(false);
    }
  };

  const handleExportReport = () => {
    if (!report) return;
    const lines = [
      'Bank Reconciliation Report',
      `Account: ${report.session.account_name || report.session.account_id}`,
      `Statement Date: ${new Date(report.session.statement_date).toLocaleDateString()}`,
      '',
      '--- Summary ---',
      `Opening Bank Balance: ${fmt(report.session.opening_balance)}`,
      `Closing Bank Balance: ${fmt(report.session.closing_balance)}`,
      `Total Transactions: ${report.total_transactions}`,
      `Matched: ${report.matched_count} (${fmt(report.matched_amount)})`,
      `Unmatched: ${report.unmatched_count} (${fmt(report.unmatched_amount)})`,
      `Reconciled: ${report.reconciled_count} (${fmt(report.reconciled_amount)})`,
      '',
      '--- Unreconciled Items ---',
      'Date,Description,Reference,Amount,Status',
      ...report.unreconciled_items.map(
        (item) => `${item.date},"${item.description}",${item.reference || ''},${fmt(item.amount)},${item.status}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconciliation-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const sessionStatusBadge = (status: string) => {
    const cls =
      status === 'completed'
        ? 'bg-green-100 text-green-800'
        : status === 'in_progress'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-gray-100 text-gray-600';
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status.replace('_', ' ')}</span>;
  };

  const txStatusBadge = (status: string) => {
    const cls =
      status === 'reconciled'
        ? 'bg-green-100 text-green-800'
        : status === 'matched'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-yellow-100 text-yellow-800';
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
  };

  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const inProgressCount = sessions.filter((s) => s.status === 'in_progress').length;

  const renderSessionsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{sessions.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{inProgressCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reconciliation sessions found</p>
          <button onClick={() => setShowNewSessionModal(true)} className="mt-2 text-primary-600 text-sm font-medium hover:underline">
            Create your first session
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Account</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statement Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Opening Balance</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Closing Balance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => enterSession(session)}>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{session.account_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{session.account_code}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(session.statement_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{fmt(session.opening_balance)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{fmt(session.closing_balance)}</td>
                  <td className="px-4 py-3">{sessionStatusBadge(session.status)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        enterSession(session);
                      }}
                      className="text-primary-600 text-sm font-medium hover:underline"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderMatchingTab = () => {
    if (!currentSession) {
      return (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Select a session to start matching</p>
          <button onClick={backToSessions} className="mt-2 text-primary-600 text-sm font-medium hover:underline">
            Go to Sessions
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={backToSessions} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium text-gray-900">{currentSession.account_name || currentSession.account_id}</span>
              <span>Statement: {new Date(currentSession.statement_date).toLocaleDateString()}</span>
              <span>Opening: {fmt(currentSession.opening_balance)}</span>
              <span>Closing: {fmt(currentSession.closing_balance)}</span>
            </div>
          </div>
          <div>{sessionStatusBadge(currentSession.status)}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(['all', 'unmatched', 'matched', 'reconciled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setSelectedIds(new Set()); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {importing ? 'Importing...' : 'Import Statement'}
            </button>
            <button
              onClick={handleAutoMatch}
              disabled={processing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
              Auto-Match
            </button>
            <button
              onClick={handleApplyRules}
              disabled={processing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <Filter className="w-4 h-4" />
              Apply Rules
            </button>
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={handleBulkReconcile}
                  disabled={processing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Reconcile ({selectedIds.size})
                </button>
                <button
                  onClick={handleBulkUnreconcile}
                  disabled={processing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Unreconcile ({selectedIds.size})
                </button>
              </>
            )}
            {currentSession.status === 'in_progress' && (
              <button
                onClick={handleCloseSession}
                disabled={processing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Square className="w-4 h-4" />
                Close Session
              </button>
            )}
            {currentSession.status === 'completed' && (
              <button
                onClick={handleReopenSession}
                disabled={processing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                Reopen Session
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Bank Statement Transactions</h3>
            </div>
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No transactions found</p>
                <p className="text-xs text-gray-400 mt-1">Import a bank statement CSV to get started</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="w-10 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Ref</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(tx.id)}
                            onChange={() => toggleSelect(tx.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 max-w-[200px] truncate">{tx.description}</td>
                        <td className="px-3 py-2 text-sm text-gray-500">{tx.reference || '-'}</td>
                        <td className={`px-3 py-2 text-sm text-right font-medium ${tx.amount >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                          {tx.amount >= 0 ? '+' : ''}{fmt(tx.amount)}
                        </td>
                        <td className="px-3 py-2">{txStatusBadge(tx.status)}</td>
                        <td className="px-3 py-2">
                          {tx.status === 'unmatched' && (
                            <button onClick={() => openMatchModal(tx)} className="text-primary-600 text-sm font-medium hover:underline">
                              Match
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Book Transactions (Unmatched Journal Entries)</h3>
            </div>
            {bookTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No unmatched book transactions</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Entry #</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookTransactions.map((bt) => (
                      <tr key={bt.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-mono text-gray-900">{bt.journal_number}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{new Date(bt.entry_date).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 max-w-[200px] truncate">{bt.description}</td>
                        <td className={`px-3 py-2 text-sm text-right font-medium ${bt.amount >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                          {fmt(bt.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRulesTab = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No bank rules configured</p>
          <button onClick={() => setShowNewRuleModal(true)} className="mt-2 text-primary-600 text-sm font-medium hover:underline">
            Create your first rule
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Match Field</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Match Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Match Value</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Target Account</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Active</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{rule.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{rule.match_field}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{rule.match_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">{rule.match_value}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rule.target_account_name || rule.target_account_id}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{rule.priority}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleRule(rule.id, rule.is_active)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        rule.is_active ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                          rule.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-red-500 text-sm font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderReportTab = () => {
    if (!currentSession) {
      return (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Select a session to view its report</p>
          <button onClick={backToSessions} className="mt-2 text-primary-600 text-sm font-medium hover:underline">
            Go to Sessions
          </button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
        </div>
      );
    }

    if (!report) {
      return (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Report not available</p>
        </div>
      );
    }

    const diff = report.session.closing_balance - report.reconciled_amount;

    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Bank Statement</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Opening Balance</span>
                <span className="font-medium text-gray-900">{fmt(report.session.opening_balance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Closing Balance</span>
                <span className="font-medium text-gray-900">{fmt(report.session.closing_balance)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Book Balance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reconciled Amount</span>
                <span className="font-medium text-gray-900">{fmt(report.reconciled_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Difference</span>
                <span className={`font-medium ${Math.abs(diff) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                  {diff >= 0 ? '+' : ''}{fmt(diff)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Transaction Breakdown</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{report.total_transactions}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{report.matched_count}</p>
              <p className="text-xs text-gray-500">Matched ({fmt(report.matched_amount)})</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{report.unmatched_count}</p>
              <p className="text-xs text-gray-500">Unmatched ({fmt(report.unmatched_amount)})</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{report.reconciled_count}</p>
              <p className="text-xs text-gray-500">Reconciled ({fmt(report.reconciled_amount)})</p>
            </div>
          </div>
        </div>

        {report.unreconciled_items.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900">Unreconciled Items</h4>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.unreconciled_items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{item.reference || '-'}</td>
                    <td className={`px-4 py-2 text-sm text-right font-medium ${item.amount >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                      {fmt(item.amount)}
                    </td>
                    <td className="px-4 py-2">{txStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Reconciliation"
        subtitle="Reconcile bank statements with book records"
      >
        {activeTab === 'sessions' && (
          <button
            onClick={() => setShowNewSessionModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
        )}
      </PageHeader>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              if (tab.key !== 'matching' || currentSession) {
                setActiveTab(tab.key);
              }
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sessions' && renderSessionsTab()}
      {activeTab === 'matching' && renderMatchingTab()}
      {activeTab === 'rules' && renderRulesTab()}
      {activeTab === 'report' && renderReportTab()}

      {showNewSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Reconciliation Session</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                <select
                  value={newSessionForm.accountId}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, accountId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statement Date</label>
                <input
                  type="date"
                  value={newSessionForm.statementDate}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, statementDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={newSessionForm.openingBalance}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, openingBalance: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={newSessionForm.closingBalance}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, closingBalance: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowNewSessionModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreateSession} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {showNewRuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Bank Rule</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRuleForm.name}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Bank Fees"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Match Field</label>
                  <select
                    value={newRuleForm.match_field}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, match_field: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="description">Description</option>
                    <option value="reference">Reference</option>
                    <option value="amount">Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Match Type</label>
                  <select
                    value={newRuleForm.match_type}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, match_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="contains">Contains</option>
                    <option value="equals">Equals</option>
                    <option value="starts_with">Starts With</option>
                    <option value="ends_with">Ends With</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Match Value</label>
                <input
                  type="text"
                  value={newRuleForm.match_value}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, match_value: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., FEE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Account</label>
                <select
                  value={newRuleForm.target_account_id}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, target_account_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <input
                  type="number"
                  min="1"
                  value={newRuleForm.priority}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, priority: parseInt(e.target.value) || 1 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowNewRuleModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreateRule} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {showMatchModal && matchTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Match Transaction</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {matchTarget.description} - {fmt(matchTarget.amount)}
                </p>
              </div>
              <button onClick={() => { setShowMatchModal(false); setMatchTarget(null); }} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => searchBookEntries(e.target.value)}
                  placeholder="Search journal entries..."
                  className="w-full pl-10 pr-3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  {searchQuery ? 'No matching entries found' : 'Type to search journal entries'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((bt) => (
                    <div key={bt.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bt.journal_number}</div>
                        <div className="text-xs text-gray-500">{bt.description} - {new Date(bt.entry_date).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${bt.amount >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                          {fmt(bt.amount)}
                        </span>
                        <button
                          onClick={() => handleMatch(bt.id)}
                          className="px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                        >
                          Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
