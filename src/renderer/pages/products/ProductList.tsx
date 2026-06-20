import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductForm } from './ProductForm';
import { Plus, Search, Package, Loader2, Edit2, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { CsvImport } from '../../components/CsvImport';

export function ProductList() {
  const navigate = useNavigate();
  const { products, isLoading, fetchProducts, deleteProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    fetchProducts(search);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
        <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-2">
          <Upload className="w-4 h-4" /> Import CSV
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or SKU..."
            className="input pl-9"
          />
        </div>
        <button onClick={handleSearch} className="btn-secondary">Search</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No products found</p>
            <button onClick={handleCreate} className="text-blue-600 text-sm mt-2 hover:underline">
              Create your first product
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">SKU</th>
                <th className="table-header">Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">UOM</th>
                <th className="table-header">Price</th>
                <th className="table-header">Stock</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-cell font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="table-cell font-medium">
                    <button
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      {p.name}
                    </button>
                  </td>
                  <td className="table-cell text-gray-500">
                    {p.productType?.replace('_', ' ')}
                  </td>
                  <td className="table-cell text-gray-500">{p.uom}</td>
                  <td className="table-cell font-medium">
                    ₦{Number(p.unitPrice).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <span className={Number(p.stockQuantity || 0) > 0 ? 'text-gray-900' : 'text-red-500'}>
                      {p.stockQuantity ?? 0}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSaved={() => { setShowForm(false); setEditingProduct(null); fetchProducts(); }}
        />
      )}

      {showImport && (
        <CsvImport
          title="Products"
          templateHeaders={['sku', 'name', 'description', 'productType', 'uom', 'unitPrice']}
          requiredFields={['sku', 'name', 'productType', 'uom']}
          onImport={async (items) => {
            const mapped = items.map((item) => ({
              ...item,
              unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
            }));
            const { data } = await api.post('/inventory/products/batch', { items: mapped });
            return data;
          }}
          onClose={() => { setShowImport(false); fetchProducts(); }}
        />
      )}
    </div>
  );
}
