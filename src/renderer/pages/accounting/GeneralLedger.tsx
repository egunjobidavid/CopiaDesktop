import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Loader2, BookOpen, Eye } from 'lucide-react';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  isActive: boolean;
}

interface JournalLine {
  accountCode: string;
  debit: string;
  credit: string;
  description: string;
}

interface JournalEntry {
  id: string;
  journal_number: string;
  entry_date: string;
  created_at: string;
  description: string;
  status: string;
  reference_type?: string;
  reference_id?: string;
  lines?: any[];
}

export function GeneralLedger() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [description, setDescription] = useState('');
  const [referenceType, setReferenceType] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([
    { accountCode: '', debit: '', credit: '', description: '' },
    { accountCode: '', debit: '', credit: '', description: '' },
  ]);

  useEffect(() => {
    loadEntries();
    loadAccounts();
  }, [page]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounting/journal', { params: { page, limit: 20 } });
      setEntries(res.data?.data || res.data?.rows || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err: any) {
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const res = await api.get('/accounting/accounts');
      setAccounts(res.data?.data || res.data || []);
    } catch (_) {}
  };

  const getAccountName = (code: string) => {
    const acc = accounts.find((a) => a.code === code);
    return acc ? `${acc.code} - ${acc.name}` : code;
  };

  const addLine = () => {
    setLines([...lines, { accountCode: '', debit: '', credit: '', description: '' }]);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: keyof JournalLine, value: string) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'debit' && value) updated[idx].credit = '';
    if (field === 'credit' && value) updated[idx].debit = '';
    setLines(updated);
  };

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleCreate = async () => {
    if (!description.trim()) { toast.error('Description is required'); return; }
    const validLines = lines.filter((l) => l.accountCode && (Number(l.debit) > 0 || Number(l.credit) > 0));
    if (validLines.length < 2) { toast.error('At least 2 lines are required'); return; }
    if (!isBalanced) { toast.error('Debits must equal credits'); return; }

    setSubmitting(true);
    try {
      await api.post('/accounting/journal', {
        description: description.trim(),
        referenceType: referenceType.trim() || undefined,
        lines: validLines.map((l) => ({
          accountCode: l.accountCode,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description.trim() || undefined,
        })),
      });
      toast.success('Journal entry posted');
      setShowCreate(false);
      resetForm();
      loadEntries();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to post journal entry');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setReferenceType('');
    setLines([
      { accountCode: '', debit: '', credit: '', description: '' },
      { accountCode: '', debit: '', credit: '', description: '' },
    ]);
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    posted: 'bg-blue-100 text-blue-700',
    void: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Ledger"
        subtitle="View and create journal entries. Debits must equal credits."
        action={{ label: 'New Journal Entry', onClick: () => { resetForm(); setShowCreate(true); } }}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => window.location.href = '/accounting/chart-of-accounts'} className="card p-4 hover:border-primary-300 transition-colors text-left">
          <p className="text-xs text-gray-500">Chart of Accounts</p>
          <p className="text-lg font-bold text-gray-900">{accounts.length} accounts</p>
        </button>
        <button onClick={() => window.location.href = '/accounting/trial-balance'} className="card p-4 hover:border-primary-300 transition-colors text-left">
          <p className="text-xs text-gray-500">Trial Balance</p>
          <p className="text-lg font-bold text-gray-900">{totalDebit > 0 ? 'View' : 'No entries'}</p>
        </button>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Journal Entries</p>
          <p className="text-lg font-bold text-gray-900">{entries.length} this page</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No journal entries yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first journal entry to start tracking finances</p>
            <button onClick={() => { resetForm(); setShowCreate(true); }} className="mt-3 text-primary-600 text-sm font-medium hover:underline">
              New Journal Entry
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Entry #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Lines</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{entry.journal_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(entry.entry_date || entry.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{entry.description || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.reference_type || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[entry.status] || 'bg-gray-100 text-gray-600'}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.lines?.length || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelectedEntry(entry)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Previous</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Next</button>
        </div>
      )}

      {/* Create Journal Entry Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">New Journal Entry</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Office rent payment" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Type</label>
                  <input value={referenceType} onChange={(e) => setReferenceType(e.target.value)} placeholder="e.g. invoice, receipt" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Journal Lines</label>
                  <button onClick={addLine} className="text-primary-600 text-xs font-medium hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Line
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Account *</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-40">Description</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 w-28">Debit</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 w-28">Credit</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, idx) => (
                        <tr key={idx} className="border-b border-gray-50 last:border-b-0">
                          <td className="px-2 py-1.5">
                            <select value={line.accountCode} onChange={(e) => updateLine(idx, 'accountCode', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary-500">
                              <option value="">Select account</option>
                              {accounts.filter((a) => a.isActive).map((a) => (
                                <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-1.5">
                            <input value={line.description} onChange={(e) => updateLine(idx, 'description', e.target.value)} placeholder="Optional" className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs" />
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="number" value={line.debit} onChange={(e) => updateLine(idx, 'debit', e.target.value)} placeholder="0.00" min="0" step="0.01" className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-right" />
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="number" value={line.credit} onChange={(e) => updateLine(idx, 'credit', e.target.value)} placeholder="0.00" min="0" step="0.01" className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-right" />
                          </td>
                          <td className="px-1 py-1.5">
                            <button onClick={() => removeLine(idx)} disabled={lines.length <= 2} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-30">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t border-gray-200 font-medium">
                        <td colSpan={2} className="px-3 py-2 text-xs text-right text-gray-700">Totals</td>
                        <td className="px-3 py-2 text-xs text-right text-gray-900">₦{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-xs text-right text-gray-900">₦{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className={`mt-2 text-xs font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {isBalanced ? 'Balanced' : `Out of balance by ₦${Math.abs(totalDebit - totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={submitting || !isBalanced} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Post Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Entry Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedEntry.journal_number}</h3>
                <p className="text-sm text-gray-500">{selectedEntry.description}</p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-3 text-sm text-gray-600 border-b border-gray-100">
              <p>Date: {new Date(selectedEntry.entry_date || selectedEntry.created_at).toLocaleDateString()}</p>
              {selectedEntry.reference_type && <p>Reference: {selectedEntry.reference_type}</p>}
              <p>Status: <span className="capitalize font-medium">{selectedEntry.status}</span></p>
            </div>
            {selectedEntry.lines && selectedEntry.lines.length > 0 && (
              <div className="px-6 py-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-xs font-medium text-gray-500">Account</th>
                      <th className="text-left py-2 text-xs font-medium text-gray-500">Description</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500">Debit</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.lines.map((line: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="py-2 text-xs">{getAccountName(line.account_code || line.accountId || line.account_id)}</td>
                        <td className="py-2 text-xs">{line.description || '-'}</td>
                        <td className="py-2 text-xs text-right">{Number(line.debit || 0) > 0 ? `₦${Number(line.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}</td>
                        <td className="py-2 text-xs text-right">{Number(line.credit || 0) > 0 ? `₦${Number(line.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end px-6 py-4 border-t border-gray-200">
              <button onClick={() => setSelectedEntry(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
