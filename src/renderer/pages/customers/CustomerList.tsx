import { useState, useEffect } from 'react';
import { Plus, Search, Users, Loader2, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  totalDue?: number;
}

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => { fetchCustomers(); }, []);

  async function fetchCustomers(q?: string) {
    setIsLoading(true);
    try {
      const params = q ? `?search=${encodeURIComponent(q)}&limit=50` : '?limit=50';
      const { data } = await api.get(`/customers${params}`);
      setCustomers(Array.isArray(data) ? data : []);
    } catch { setCustomers([]); } finally { setIsLoading(false); }
  }

  async function handleCreate() {
    if (!form.name.trim()) { toast.error('Customer name is required'); return; }
    try {
      await api.post('/customers', form);
      toast.success('Customer created');
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', address: '' });
      await fetchCustomers();
    } catch { toast.error('Failed to create customer'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomers(search)}
            placeholder="Search customers..." className="input pl-9" />
        </div>
        <button onClick={() => fetchCustomers(search)} className="btn-secondary">Search</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No customers found</p>
            <button onClick={() => setShowForm(true)} className="text-blue-600 text-sm mt-2 hover:underline">
              Add your first customer
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Address</th>
                <th className="table-header">Balance</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{c.name}</td>
                  <td className="table-cell text-gray-500">
                    {c.email ? <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{c.email}</span> : '-'}
                  </td>
                  <td className="table-cell text-gray-500">
                    {c.phone ? <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{c.phone}</span> : '-'}
                  </td>
                  <td className="table-cell text-gray-500 text-sm max-w-[200px] truncate">
                    {c.address ? <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{c.address}</span> : '-'}
                  </td>
                  <td className="table-cell font-medium">
                    ₦{Number(c.totalDue || 0).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
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
            <h2 className="text-lg font-semibold mb-4">New Customer</h2>
            <div className="space-y-3">
              <input placeholder="Name *" className="input w-full" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="Email" className="input w-full" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input placeholder="Phone" className="input w-full" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <textarea placeholder="Address" className="input w-full" rows={2} value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleCreate} className="btn-primary">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
