import { useCallback, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF, InvoiceData } from '../components/Invoice/InvoicePDF';
import toast from 'react-hot-toast';

export function useInvoicePrint() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const generateInvoiceHtml = useCallback((data: InvoiceData): string => {
    const lineItemsHtml = data.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
            <div style="font-size: 12px;">${item.name}</div>
            ${item.sku ? `<div style="font-size: 10px; color: #9ca3af;">${item.sku}</div>` : ''}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₦${item.unitPrice.toLocaleString()}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₦${item.lineTotal.toLocaleString()}</td>
        </tr>`,
      )
      .join('');

    const balanceDue = data.balanceDue ?? data.total - (data.amountPaid || 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${data.invoiceNumber}</title>
        <style>
          @page { margin: 20mm; }
          body { font-family: 'Helvetica', Arial, sans-serif; color: #1f2937; font-size: 12px; line-height: 1.5; }
          .invoice-title { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 20px; }
          .divider { border-bottom: 2px solid #1e40af; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background-color: #f3f4f6; padding: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #f3f4f6; }
          .totals { margin-left: auto; width: 50%; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
          .grand-total { border-top: 2px solid #1e40af; padding-top: 8px; font-weight: bold; font-size: 14px; color: #1e40af; }
          .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 10px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div class="invoice-title">INVOICE</div>
          ${data.status ? `<div style="background: ${statusBadgeColor(data.status)}; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 11px;">${data.status.toUpperCase()}</div>` : ''}
        </div>
        <div class="divider"></div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <div style="font-weight: bold; font-size: 14px;">${data.companyName}</div>
            <div style="color: #6b7280; font-size: 11px;">${data.companyAddress.replace(/\n/g, '<br>')}</div>
            <div style="color: #6b7280; font-size: 11px;">Phone: ${data.companyPhone}</div>
            <div style="color: #6b7280; font-size: 11px;">Email: ${data.companyEmail}</div>
            <div style="color: #6b7280; font-size: 11px;">Tax ID: ${data.companyTaxId}</div>
          </div>
          <div style="text-align: right; color: #6b7280; font-size: 11px;">
            <div>Invoice: <strong>${data.invoiceNumber}</strong></div>
            <div>Date: ${data.invoiceDate}</div>
            ${data.dueDate ? `<div>Due: ${data.dueDate}</div>` : ''}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Bill To</div>
          <div style="font-weight: bold; font-size: 13px;">${data.customerName}</div>
          <div style="color: #6b7280; font-size: 11px;">${data.customerAddress.replace(/\n/g, '<br>')}</div>
          ${data.customerPhone ? `<div style="color: #6b7280; font-size: 11px;">${data.customerPhone}</div>` : ''}
          ${data.customerEmail ? `<div style="color: #6b7280; font-size: 11px;">${data.customerEmail}</div>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40%;">Description</th>
              <th style="width: 12%; text-align: center;">Qty</th>
              <th style="width: 20%; text-align: right;">Unit Price</th>
              <th style="width: 18%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row"><span>Subtotal</span><span>₦${data.subtotal.toLocaleString()}</span></div>
          <div class="total-row"><span>Tax</span><span>₦${data.tax.toLocaleString()}</span></div>
          ${data.amountPaid !== undefined ? `<div class="total-row"><span>Paid</span><span>-₦${data.amountPaid.toLocaleString()}</span></div>` : ''}
          <div class="grand-total total-row">
            <span>${data.amountPaid !== undefined ? 'Balance Due' : 'Total'}</span>
            <span>₦${balanceDue.toLocaleString()}</span>
          </div>
        </div>

        ${data.notes ? `
        <div style="margin-top: 24px; padding: 12px; background: #f9fafb; border-radius: 4px;">
          <div style="font-size: 10px; color: #6b7280; margin-bottom: 4px;">NOTES</div>
          <div style="font-size: 11px; color: #374151;">${data.notes}</div>
        </div>` : ''}

        <div class="footer">CopiaOS — Generated on ${data.invoiceDate}</div>
      </body>
      </html>
    `;
  }, []);

  const printInvoice = useCallback(
    async (data: InvoiceData) => {
      setIsPrinting(true);
      try {
        const html = generateInvoiceHtml(data);
        if (window.electronAPI) {
          await window.electronAPI.printPDF(html);
        } else {
          const printWin = window.open('', '_blank');
          if (printWin) {
            printWin.document.write(html);
            printWin.document.close();
            printWin.focus();
            printWin.print();
          }
        }
      } catch {
        toast.error('Failed to print invoice');
      } finally {
        setIsPrinting(false);
      }
    },
    [generateInvoiceHtml],
  );

  const downloadInvoice = useCallback(
    async (data: InvoiceData) => {
      setIsDownloading(true);
      try {
        if (window.electronAPI) {
          // Use @react-pdf/renderer to generate blob, then save via IPC
          const blob = await pdf(<InvoicePDF data={data} />).toBlob();
          const buffer = await blob.arrayBuffer();
          const filename = `${data.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          const result = await window.electronAPI.saveFile(buffer, filename);
          if (result) {
            toast.success(`Invoice saved to ${result}`);
          }
        } else {
          // Browser fallback: open PDF in new tab
          const blob = await pdf(<InvoicePDF data={data} />).toBlob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${data.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Invoice downloaded');
        }
      } catch {
        toast.error('Failed to download invoice');
      } finally {
        setIsDownloading(false);
      }
    },
    [],
  );

  return { printInvoice, downloadInvoice, isPrinting, isDownloading };
}

function statusBadgeColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid': return '#16a34a';
    case 'overdue': return '#dc2626';
    case 'draft': return '#6b7280';
    case 'sent': return '#2563eb';
    default: return '#6b7280';
  }
}
