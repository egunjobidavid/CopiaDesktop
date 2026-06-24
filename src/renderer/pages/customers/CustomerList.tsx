import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Users, Loader2, Mail, Phone, MapPin, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { CsvImport } from '../../components/CsvImport';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { exportToCsv } from '../../utils/helpers';
import { TableSkeleton } from '../../components/Skeleton';

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
  const [showImport, setShowImport] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', phone: '', address: '' },
  });

  useEffect(() => { fetchCustomers(); }, []);

  async function fetchCustomers(q?: string) {
    setIsLoading(true);
    try {
      const params = q ? `?search=${encodeURIComponent(q)}&limit=50` : '?limit=50';
      const { data } = await api.get(`/customers${params}`);
      setCustomers(data?.data ?? (Array.isArray(data) ? data : []));
    } catch { setCustomers([]); } finally { setIsLoading(false); }
  }

  async function handleCreate(formData: { name: string; email: string; phone: string; address: string }) {
    try {
      await api.post('/customers', formData);
      toast.success('Customer created');
      setShowForm(false);
      reset();
      await fetchCustomers();
    } catch { toast.error('Failed to create customer'); }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customer database</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCsv(customers, [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'address', label: 'Address' },
          ], 'customers')} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Customer
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
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomers(search)}
            placeholder="Search customers..." className="input pl-9" />
        </div>
        <button onClick={() => fetchCustomers(search)} className="btn-secondary">Search</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
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
            <form onSubmit={handleSubmit(handleCreate)} className="space-y-3">
              <div>
                <input {...register('name', { required: 'Name is required' })} placeholder="Name *" className="input w-full" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <input {...register('email')} type="email" placeholder="Email" className="input w-full" />
              <input {...register('phone')} type="tel" placeholder="Phone" className="input w-full" />
              <textarea {...register('address')} placeholder="Address" className="input w-full" rows={2} />
              <div className="flex gap-3 mt-6 justify-end">
                <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImport && (
        <CsvImport
          title="Customers"
          templateHeaders={['name', 'email', 'phone', 'address', 'city', 'country']}
          requiredFields={['name']}
          onImport={async (items) => {
            const { data } = await api.post('/customers/batch', { items });
            return data;
          }}
          onClose={() => { setShowImport(false); fetchCustomers(); }}
        />
      )}
    </div>
  );
}
