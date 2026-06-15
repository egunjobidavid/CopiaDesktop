import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  statusBadge: {
    fontSize: 10,
    padding: '4 12',
    borderRadius: 4,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
    marginBottom: 16,
  },
  companySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.5,
  },
  billToSection: {
    marginBottom: 24,
  },
  billToLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  billToName: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  colDescription: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colUnitPrice: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 10,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#1e40af',
    paddingTop: 8,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  status?: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyTaxId: string;
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
  customerEmail?: string;
  items: Array<{
    name: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  notes?: string;
}

export function InvoicePDF({ data }: { data: InvoiceData }) {
  const balanceDue = data.balanceDue ?? data.total - (data.amountPaid || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>INVOICE</Text>
            {data.status && (
              <View style={[styles.statusBadge, { backgroundColor: statusColor(data.status) }]}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                  {data.status.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.divider} />
        </View>

        {/* Company & Invoice Info */}
        <View style={styles.companySection}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{data.companyName}</Text>
            <Text style={styles.addressText}>{data.companyAddress}</Text>
            <Text style={styles.addressText}>Phone: {data.companyPhone}</Text>
            <Text style={styles.addressText}>Email: {data.companyEmail}</Text>
            <Text style={styles.addressText}>Tax ID: {data.companyTaxId}</Text>
          </View>
          <View>
            <Text style={styles.addressText}>Invoice: {data.invoiceNumber}</Text>
            <Text style={styles.addressText}>Date: {data.invoiceDate}</Text>
            {data.dueDate && (
              <Text style={styles.addressText}>Due: {data.dueDate}</Text>
            )}
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billToSection}>
          <Text style={styles.billToLabel}>Bill To</Text>
          <Text style={styles.billToName}>{data.customerName}</Text>
          <Text style={styles.addressText}>{data.customerAddress}</Text>
          {data.customerPhone && (
            <Text style={styles.addressText}>{data.customerPhone}</Text>
          )}
          {data.customerEmail && (
            <Text style={styles.addressText}>{data.customerEmail}</Text>
          )}
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colUnitPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>

          {data.items.map((item, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.colDescription}>
                <Text style={{ fontSize: 10 }}>{item.name}</Text>
                {item.sku && (
                  <Text style={{ fontSize: 8, color: '#9ca3af' }}>{item.sku}</Text>
                )}
              </View>
              <Text style={[styles.colQty, { fontSize: 10 }]}>{item.quantity}</Text>
              <Text style={[styles.colUnitPrice, { fontSize: 10 }]}>
                ₦{item.unitPrice.toLocaleString()}
              </Text>
              <Text style={[styles.colTotal, { fontSize: 10 }]}>
                ₦{item.lineTotal.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₦{data.subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>₦{data.tax.toLocaleString()}</Text>
          </View>
          {data.amountPaid !== undefined && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Paid</Text>
              <Text style={styles.totalValue}>-₦{data.amountPaid.toLocaleString()}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>
              {data.amountPaid !== undefined ? 'Balance Due' : 'Total'}
            </Text>
            <Text style={styles.grandTotalValue}>
              ₦{balanceDue.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={{ marginTop: 24, padding: 12, backgroundColor: '#f9fafb', borderRadius: 4 }}>
            <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 4 }}>NOTES</Text>
            <Text style={{ fontSize: 9, color: '#374151' }}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CopiaOS — Generated on {data.invoiceDate}</Text>
          <Text style={styles.footerText}>Page 1/1</Text>
        </View>
      </Page>
    </Document>
  );
}

function statusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid': return '#16a34a';
    case 'overdue': return '#dc2626';
    case 'draft': return '#6b7280';
    case 'sent': return '#2563eb';
    default: return '#6b7280';
  }
}
