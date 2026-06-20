import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductForm } from './ProductForm';
import { StockTransferModal } from '../../components/StockTransferModal';
import { Plus, Search, Package, Loader2, Edit2, Trash2, Upload, Download, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { CsvImport } from '../../components/CsvImport';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { exportToCsv } from '../../utils/helpers';
import { TableSkeleton } from '../../components/Skeleton';

export function ProductList() {
  const navigate = useNavigate();
  const { products, isLoading, fetchProducts, deleteProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'raw_material', label: 'Raw Material' },
    { value: 'finished_good', label: 'Finished Good' },
    { value: 'service', label: 'Service' },
  ];

  const filtered = products.filter((p) => {
    if (categoryFilter !== 'all' && p.productType !== categoryFilter) return false;
    return true;
  });

  const lowStockCount = products.filter((p) => {
    const qty = Number(p.stockQuantity || 0);
    const reorder = Number(p.reorderPoint || 0);
    return reorder > 0 && qty <= reorder;
  }).length;

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog and inventory</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCsv(filtered, [
            { key: 'sku', label: 'SKU' },
            { key: 'name', label: 'Name' },
            { key: 'productType', label: 'Type' },
            { key: 'uom', label: 'UOM' },
            { key: 'unitPrice', label: 'Unit Price' },
            { key: 'stockQuantity', label: 'Stock' },
          ], 'products')} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{lowStockCount}</strong> product(s) below reorder point — restock recommended.
          </p>
        </div>
      )}

      <div className="flex gap-3 items-center">
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
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button onClick={handleSearch} className="btn-secondary">Search</button>
        <button
          onClick={() => setShowTransfer(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeftRight className="w-4 h-4" /> Stock Transfer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No products found</p>
            <button onClick={handleCreate} className="text-primary-600 text-sm mt-2 hover:underline">
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
                <th className="table-header">Reorder</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((p) => {
                const qty = Number(p.stockQuantity || 0);
                const reorder = Number(p.reorderPoint || 0);
                const isLowStock = reorder > 0 && qty <= reorder;
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 ${isLowStock ? 'bg-red-50/50' : ''}`}>
                    <td className="table-cell font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="table-cell font-medium">
                      <button
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="text-primary-600 hover:underline"
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="table-cell text-gray-500 text-sm">
                      {p.productType?.replace('_', ' ')}
                    </td>
                    <td className="table-cell text-gray-500 text-sm">{p.uom}</td>
                    <td className="table-cell font-medium text-sm">
                      ₦{Number(p.unitPrice).toLocaleString()}
                    </td>
                    <td className="table-cell">
                      <span className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {qty}
                        {isLowStock && (
                          <AlertTriangle className="w-3.5 h-3.5 inline ml-1 text-red-500" />
                        )}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {reorder > 0 ? reorder : '—'}
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
                        <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-primary-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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
          templateHeaders={['sku', 'name', 'description', 'productType', 'uom', 'unitPrice', 'barcode', 'costPrice', 'reorderPoint', 'categoryId']}
          requiredFields={['sku', 'name', 'productType', 'uom']}
          onImport={async (items) => {
            const mapped = items.map((item) => ({
              ...item,
              unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
              costPrice: item.costPrice ? Number(item.costPrice) : undefined,
              reorderPoint: item.reorderPoint ? Number(item.reorderPoint) : undefined,
            }));
            const { data } = await api.post('/inventory/products/batch', { items: mapped });
            return data;
          }}
          onClose={() => { setShowImport(false); fetchProducts(); }}
        />
      )}

      {showTransfer && <StockTransferModal onClose={() => setShowTransfer(false)} />}
    </div>
  );
}
