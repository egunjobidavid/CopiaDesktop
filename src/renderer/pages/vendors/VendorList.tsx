import { useState, useEffect } from 'react';
import { Plus, Search, ShoppingBag, Loader2, Mail, Phone, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { CsvImport } from '../../components/CsvImport';
import { Breadcrumbs } from '../../components/Breadcrumbs';

interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  isActive: boolean;
  totalDue?: number;
}

export function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', contactPerson: '' });

  useEffect(() => { fetchVendors(); }, []);

  async function fetchVendors(q?: string) {
    setIsLoading(true);
    try {
      const params = q ? `?search=${encodeURIComponent(q)}&limit=50` : '?limit=50';
      const { data } = await api.get(`/vendors${params}`);
      setVendors(data?.data ?? (Array.isArray(data) ? data : []));
    } catch { setVendors([]); } finally { setIsLoading(false); }
  }

  async function handleCreate() {
    if (!form.name.trim()) { toast.error('Vendor name is required'); return; }
    try {
      await api.post('/vendors', form);
      toast.success('Vendor created');
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', contactPerson: '' });
      await fetchVendors();
    } catch { toast.error('Failed to create vendor'); }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">Manage your suppliers and purchase contacts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
          <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchVendors(search)}
            placeholder="Search vendors..." className="input pl-9" />
        </div>
        <button onClick={() => fetchVendors(search)} className="btn-secondary">Search</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No vendors found</p>
            <button onClick={() => setShowForm(true)} className="text-blue-600 text-sm mt-2 hover:underline">
              Add your first vendor
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Name</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Email</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Balance</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{v.name}</td>
                  <td className="table-cell text-gray-500">{v.contactPerson || '-'}</td>
                  <td className="table-cell text-gray-500">
                    {v.email ? <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{v.email}</span> : '-'}
                  </td>
                  <td className="table-cell text-gray-500">
                    {v.phone ? <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{v.phone}</span> : '-'}
                  </td>
                  <td className="table-cell font-medium">₦{Number(v.totalDue || 0).toLocaleString()}</td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
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
            <h2 className="text-lg font-semibold mb-4">New Vendor</h2>
            <div className="space-y-3">
              <input placeholder="Vendor Name *" className="input w-full" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="Contact Person" className="input w-full" value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
              <input placeholder="Email" className="input w-full" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input placeholder="Phone" className="input w-full" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleCreate} className="btn-primary">Create</button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <CsvImport
          title="Vendors"
          templateHeaders={['name', 'email', 'phone', 'address', 'city', 'country']}
          requiredFields={['name']}
          onImport={async (items) => {
            const { data } = await api.post('/vendors/batch', { items });
            return data;
          }}
          onClose={() => { setShowImport(false); fetchVendors(); }}
        />
      )}
    </div>
  );
}
