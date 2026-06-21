import { useState } from 'react';
import { X, Loader2, Mail, FileText, Briefcase, Package, Handshake } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailSendModalProps {
  documentType: 'quote' | 'invoice' | 'credit_memo';
  documentNumber: string;
  documentId: string;
  defaultEmail?: string;
  onClose: () => void;
}

const TEMPLATES = [
  { key: 'general', label: 'General', icon: FileText, description: 'Standard business document' },
  { key: 'contract', label: 'Contract', icon: Handshake, description: 'For contractual agreements' },
  { key: 'project', label: 'Project', icon: Briefcase, description: 'Project-based work' },
  { key: 'supply', label: 'Supply', icon: Package, description: 'Supply of goods' },
];

const TEMPLATE_SUBJECTS: Record<string, Record<string, string>> = {
  quote: {
    general: 'Your Quote from',
    contract: 'Contract Quote from',
    project: 'Project Quote from',
    supply: 'Supply Quote from',
  },
  invoice: {
    general: 'Invoice from',
    contract: 'Contract Invoice from',
    project: 'Project Invoice from',
    supply: 'Supply Invoice from',
  },
};

const TEMPLATE_BODIES: Record<string, Record<string, string>> = {
  quote: {
    general: 'Dear {customer},\n\nPlease find attached your quotation {number}.\n\nThis quote is valid until {validUntil}.\n\nIf you have any questions, please don\'t hesitate to reach out.\n\nBest regards,\n{org}',
    contract: 'Dear {customer},\n\nPlease find attached the contract quotation {number} for your review.\n\nThis proposal outlines the terms, deliverables, and pricing for the agreed scope of work.\n\nThis quote is valid until {validUntil}.\n\nWe look forward to working with you.\n\nBest regards,\n{org}',
    project: 'Dear {customer},\n\nPlease find attached the project quotation {number} detailing the scope, milestones, and deliverables.\n\nThis quote is valid until {validUntil}.\n\nPlease review and let us know if you have any questions.\n\nBest regards,\n{org}',
    supply: 'Dear {customer},\n\nPlease find attached the supply quotation {number} for the requested goods.\n\nPricing, quantities, and estimated delivery timeline are detailed in the attached document.\n\nThis quote is valid until {validUntil}.\n\nBest regards,\n{org}',
  },
  invoice: {
    general: 'Dear {customer},\n\nPlease find attached invoice {number} for ₦{total}.\n\nPayment is due within the specified terms.\n\nIf you have any questions, please don\'t hesitate to reach out.\n\nBest regards,\n{org}',
    contract: 'Dear {customer},\n\nPlease find attached the contract invoice {number} for ₦{total}.\n\nThis invoice covers the deliverables as per our contractual agreement.\n\nPayment is due within the specified terms.\n\nBest regards,\n{org}',
    project: 'Dear {customer},\n\nPlease find attached project invoice {number} for ₦{total}.\n\nThis invoice covers the completed project milestones.\n\nPayment is due within the specified terms.\n\nBest regards,\n{org}',
    supply: 'Dear {customer},\n\nPlease find attached supply invoice {number} for ₦{total}.\n\nGoods have been dispatched/delivered as per the purchase order.\n\nPayment is due within the specified terms.\n\nBest regards,\n{org}',
  },
};

export function EmailSendModal({ documentType, documentNumber, documentId, defaultEmail, onClose }: EmailSendModalProps) {
  const [to, setTo] = useState(defaultEmail || '');
  const [template, setTemplate] = useState('general');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [includeAttachment, setIncludeAttachment] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const handleTemplateChange = (t: string) => {
    setTemplate(t);
    const prefix = TEMPLATE_SUBJECTS[documentType]?.[t] || 'Your document from';
    setSubject(`${prefix} {{orgName}} - ${documentNumber}`);

    const bodyTemplate = TEMPLATE_BODIES[documentType]?.[t] || '';
    setBody(
      bodyTemplate
        .replace('{customer}', '{{Customer Name}}')
        .replace('{number}', documentNumber)
        .replace('{total}', '{{total}}')
        .replace('{validUntil}', '{{valid until}}')
        .replace('{org}', '{{Organization}}')
    );
  };

  const handleSend = async () => {
    if (!to.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    setIsSending(true);
    try {
      const { default: api } = await import('../api/client');
      const endpoint = documentType === 'credit_memo'
        ? `/credit-memos/${documentId}/send`
        : `/${documentType === 'quote' ? 'quotes' : 'sales/invoices'}/${documentId}/send`;

      await api.post(endpoint, {
        to: to.trim(),
        subject: subject.trim() || undefined,
        body: body.trim() || undefined,
        template,
      });
      toast.success(`${documentType === 'quote' ? 'Quote' : 'Invoice'} sent successfully`);
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
          <h2 className="text-lg font-semibold text-gray-900">
            Send {documentType === 'quote' ? 'Quote' : 'Invoice'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Document Type Badge */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{documentNumber}</p>
              <p className="text-xs text-gray-500">{documentType === 'quote' ? 'Quotation' : 'Invoice'}</p>
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => handleTemplateChange(t.key)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all ${
                      template === t.key
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${template === t.key ? 'text-primary-600' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm font-medium ${template === t.key ? 'text-primary-700' : 'text-gray-700'}`}>
                        {t.label}
                      </p>
                      <p className="text-[11px] text-gray-400 leading-tight">{t.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              autoFocus
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={`Your ${documentType} ${documentNumber}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y font-mono"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Use {'{{variable}}'} placeholders: {'{{Customer Name}}'}, {'{{total}}'}, {'{{valid until}}'}, {'{{Organization}}'}
            </p>
          </div>

          {/* Include PDF */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeAttachment}
              onChange={(e) => setIncludeAttachment(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label className="text-sm text-gray-700">Include as PDF attachment</label>
          </div>

          {/* Actions */}
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
            <button onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
