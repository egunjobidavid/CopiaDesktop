import { useState, useEffect } from 'react';
import { LifeBuoy, Send, Loader2, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
}

export function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [sending, setSending] = useState(false);

  const loadTickets = () => {
    api.get('/support').then(({ data }) => {
      setTickets(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadTickets(); }, []);

  const submitTicket = async () => {
    if (!subject.trim() || !message.trim()) { toast.error('Subject and message are required'); return; }
    setSending(true);
    try {
      await api.post('/support', { subject, message, priority });
      toast.success('Support ticket submitted');
      setSubject('');
      setMessage('');
      setPriority('normal');
      loadTickets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSending(false);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = { open: 'bg-blue-100 text-blue-700', in_progress: 'bg-amber-100 text-amber-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-500' };
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-500'}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-500 mt-1">Submit a ticket or view your existing requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Ticket */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Submit a Ticket</h2>
              <p className="text-xs text-gray-500">Contact the CopiaOS support team</p>
            </div>
          </div>
          <div className="space-y-3">
            <input type="text" placeholder="Subject *" className="input w-full text-sm" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <textarea placeholder="Describe your issue in detail *" className="input w-full text-sm min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} />
            <select className="input w-full text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button onClick={submitTicket} disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Ticket</>}
            </button>
          </div>
        </div>

        {/* My Tickets */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">My Tickets</h2>
              <p className="text-xs text-gray-500">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No tickets yet</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {tickets.map((t) => (
                <div key={t.id} className="p-3 rounded-lg border border-gray-200 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 truncate">{t.subject}</p>
                    {statusBadge(t.status)}
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2">{t.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" /> {new Date(t.created_at).toLocaleDateString('en-GB')}
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${t.priority === 'urgent' ? 'bg-red-100 text-red-700' : t.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{t.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
