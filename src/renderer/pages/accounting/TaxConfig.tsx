import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: string;
  isActive: boolean;
}

export function TaxConfig() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', rate: '', type: 'VAT' });

  useEffect(() => {
    loadTaxRates();
  }, []);

  const loadTaxRates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounting/tax-rates');
      const data = res.data?.data || res.data || [];
      setTaxRates(Array.isArray(data) ? data : []);
    } catch (err: any) {
      // Tax rates endpoint might not exist yet
      setTaxRates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!form.name || !form.rate) {
        toast.error('Name and rate are required');
        return;
      }
      await api.post('/accounting/tax-rates', {
        name: form.name,
        rate: parseFloat(form.rate),
        type: form.type,
      });
      toast.success('Tax rate created');
      setShowForm(false);
      setForm({ name: '', rate: '', type: 'VAT' });
      loadTaxRates();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create tax rate');
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/accounting/tax-rates/${id}`, { isActive: !isActive });
      toast.success('Updated');
      loadTaxRates();
    } catch (err: any) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Configuration"
        subtitle="Manage tax rates for your organization"
        action={{ label: 'Add Tax Rate', onClick: () => setShowForm(true) }}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
          </div>
        ) : taxRates.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No tax rates configured</p>
            <p className="text-sm text-gray-400 mt-1">Add tax rates to apply them to invoices and transactions</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {taxRates.map((tax) => (
                <tr key={tax.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{tax.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{tax.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{tax.rate}%</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${tax.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {tax.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(tax.id, tax.isActive)}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {tax.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Tax Rate</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., VAT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.rate}
                  onChange={(e) => setForm({ ...form, rate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 7.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="VAT">VAT</option>
                  <option value="Sales Tax">Sales Tax</option>
                  <option value="Withholding">Withholding</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
