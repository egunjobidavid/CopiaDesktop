import { useState, useEffect } from 'react';
import { Wallet, Plus, Loader2, Tag, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';

interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryName?: string;
  date: string;
  createdAt: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
}

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ description: '', amount: '', categoryId: '', date: new Date().toISOString().split('T')[0] });
  const [catForm, setCatForm] = useState({ name: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    try {
      const [expRes, catRes] = await Promise.allSettled([
        api.get('/expenses?limit=100'),
        api.get('/expenses/categories'),
      ]);
      if (expRes.status === 'fulfilled') setExpenses(Array.isArray(expRes.value.data) ? expRes.value.data : []);
      if (catRes.status === 'fulfilled') setCategories(Array.isArray(catRes.value.data) ? catRes.value.data : []);
    } catch { /* ignore */ } finally { setIsLoading(false); }
  }

  async function handleCreateExpense() {
    if (!form.description.trim() || !form.amount) { toast.error('Description and amount are required'); return; }
    try {
      await api.post('/expenses', { ...form, amount: Number(form.amount) });
      toast.success('Expense recorded');
      setShowForm(false);
      setForm({ description: '', amount: '', categoryId: '', date: new Date().toISOString().split('T')[0] });
      await load();
    } catch { toast.error('Failed to create expense'); }
  }

  async function handleCreateCategory() {
    if (!catForm.name.trim()) { toast.error('Category name is required'); return; }
    try {
      await api.post('/expenses/categories', catForm);
      toast.success('Category created');
      setShowCategoryForm(false);
      setCatForm({ name: '' });
      await load();
    } catch { toast.error('Failed to create category'); }
  }

  const filtered = filter === 'all' ? expenses : expenses.filter((e) => e.categoryName === filter);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowCategoryForm(true)} className="btn-secondary flex items-center gap-2">
            <Tag className="w-4 h-4" /> Categories
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₦{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{categories.length}</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setFilter(c.name)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filter === c.name ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Wallet className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No expenses found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Description</th>
                <th className="table-header">Category</th>
                <th className="table-header">Date</th>
                <th className="table-header">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{e.description}</td>
                  <td className="table-cell">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      {e.categoryName || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="table-cell text-gray-500 text-sm">
                    {new Date(e.date || e.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="table-cell font-medium text-red-600">-₦{Number(e.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Record Expense</h2>
            <div className="space-y-3">
              <input placeholder="Description *" className="input w-full" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <input type="number" placeholder="Amount *" className="input w-full" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <select className="input w-full" value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="date" className="input w-full" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleCreateExpense} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-4">New Category</h2>
            <input placeholder="Category name" className="input w-full" value={catForm.name}
              onChange={(e) => setCatForm({ name: e.target.value })} />
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowCategoryForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleCreateCategory} className="btn-primary">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
