import { useState, useEffect } from 'react';
import { useInvoicePrint } from '../hooks/useInvoicePrint';
import { PrintButton } from '../components/Invoice/PrintButton';
import { DownloadButton } from '../components/Invoice/DownloadButton';
import { InvoiceData } from '../components/Invoice/InvoicePDF';
import { FileText, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { printInvoice, downloadInvoice, isPrinting, isDownloading } = useInvoicePrint();

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setIsLoading(true);
    try {
      const api = (await import('../api/client')).default;
      const { data } = await api.get('/sales/invoices?limit=50');
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      // Silently fail — table will show empty
    } finally {
      setIsLoading(false);
    }
  }

  const buildInvoiceData = (inv: any): InvoiceData => ({
    invoiceNumber: inv.invoiceNumber || inv.id?.slice(0, 8) || 'N/A',
    invoiceDate: inv.invoiceDate
      ? new Date(inv.invoiceDate).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB'),
    dueDate: inv.dueDate
      ? new Date(inv.dueDate).toLocaleDateString('en-GB')
      : undefined,
    status: inv.status || 'draft',
    companyName: 'Your Company Name',
    companyAddress: '123 Business Street\nLagos, Nigeria',
    companyPhone: '+234 800 000 0000',
    companyEmail: 'hello@copiaos.app',
    companyTaxId: 'RC: 1234567',
    customerName: inv.customer?.name || 'Walk-in Customer',
    customerAddress: inv.customer?.address || 'N/A',
    items: (inv.items || []).map((i: any) => ({
      name: i.product?.name || i.name || 'Item',
      sku: i.product?.sku || i.sku,
      quantity: Number(i.quantity) || 1,
      unitPrice: Number(i.unitPrice) || 0,
      lineTotal: Number(i.lineTotal) || Number(i.quantity) * Number(i.unitPrice) || 0,
    })),
    subtotal: Number(inv.subtotal) || 0,
    tax: Number(inv.tax) || 0,
    total: Number(inv.total) || 0,
    amountPaid: Number(inv.amountPaid) || undefined,
    notes: inv.notes || undefined,
  });

  const handlePrint = (inv: any) => {
    const data = buildInvoiceData(inv);
    printInvoice(data);
  };

  const handleDownload = (inv: any) => {
    const data = buildInvoiceData(inv);
    downloadInvoice(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No invoices yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Invoices will appear here after completing sales from the POS
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Invoice</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Date</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">
                    {inv.invoiceNumber || inv.id?.slice(0, 8)}
                  </td>
                  <td className="table-cell">{inv.customer?.name || 'Walk-in'}</td>
                  <td className="table-cell text-gray-500">
                    {inv.invoiceDate
                      ? new Date(inv.invoiceDate).toLocaleDateString('en-GB')
                      : '-'}
                  </td>
                  <td className="table-cell font-medium">
                    ₦{Number(inv.total || 0).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        inv.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : inv.status === 'overdue'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {inv.status || 'draft'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <PrintButton
                        onClick={() => handlePrint(inv)}
                        disabled={isPrinting}
                      />
                      <DownloadButton
                        onClick={() => handleDownload(inv)}
                        disabled={isDownloading}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
