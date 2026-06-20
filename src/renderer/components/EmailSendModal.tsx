import { useState } from 'react';
import { X, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailSendModalProps {
  documentType: 'quote' | 'invoice' | 'credit_memo';
  documentNumber: string;
  documentId: string;
  defaultEmail?: string;
  onClose: () => void;
}

export function EmailSendModal({ documentType, documentNumber, documentId, defaultEmail, onClose }: EmailSendModalProps) {
  const [to, setTo] = useState(defaultEmail || '');
  const [subject, setSubject] = useState(`Your ${documentType.replace('_', ' ')} ${documentNumber}`);
  const [body, setBody] = useState(
    `Dear Customer,\n\nPlease find attached your ${documentType.replace('_', ' ')} ${documentNumber}.\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nYour Team`
  );
  const [includeAttachment, setIncludeAttachment] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!to.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    setIsSending(true);
    try {
      const { default: api } = await import('../api/client');
      await api.post(`/${documentType === 'credit_memo' ? 'credit-memos' : `${documentType}s`}/${documentId}/send`, {
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        includeAttachment,
      });
      toast.success(`Email sent successfully`);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Send Email</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeAttachment}
              onChange={(e) => setIncludeAttachment(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label className="text-sm text-gray-700">Include PDF attachment</label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSend}
              disabled={isSending || !to.trim()}
              className="flex-1 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {isSending ? 'Sending...' : 'Send Email'}
            </button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
