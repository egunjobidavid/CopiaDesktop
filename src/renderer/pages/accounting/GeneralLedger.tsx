import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    loadEntries();
  }, [page]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounting/journal', { params: { page, limit: 20 } });
      setEntries(res.data?.rows || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err: any) {
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const viewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
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
        subtitle="View all journal entries"
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No journal entries found</p>
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
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                  onClick={() => viewEntry(entry)}
                >
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedEntry.journal_number}</h3>
                <p className="text-sm text-gray-500">{selectedEntry.description}</p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="mb-4 text-sm text-gray-600">
              <p>Date: {new Date(selectedEntry.entry_date || selectedEntry.created_at).toLocaleDateString()}</p>
              {selectedEntry.reference_type && <p>Reference Type: {selectedEntry.reference_type}</p>}
              <p>Status: <span className="capitalize">{selectedEntry.status}</span></p>
            </div>
            {selectedEntry.lines && selectedEntry.lines.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Account</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Debit</th>
                    <th className="text-right py-2">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEntry.lines.map((line: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-2 font-mono text-xs">{line.account_id}</td>
                      <td className="py-2">{line.description || '-'}</td>
                      <td className="py-2 text-right">{Number(line.debit || 0) > 0 ? Number(line.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className="py-2 text-right">{Number(line.credit || 0) > 0 ? Number(line.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex justify-end mt-4">
              <button onClick={() => setSelectedEntry(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
