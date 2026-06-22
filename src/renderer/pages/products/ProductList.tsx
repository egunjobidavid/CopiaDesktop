import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductForm } from './ProductForm';
import { StockTransferModal } from '../../components/StockTransferModal';
import { Plus, Search, Package, Loader2, Edit2, Trash2, Upload, Download, ArrowLeftRight, AlertTriangle, ChevronDown, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { CsvImport } from '../../components/CsvImport';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { exportToCsv } from '../../utils/helpers';
import { TableSkeleton } from '../../components/Skeleton';

interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  costPrice: number;
  stock: number;
  barcode: string;
}

export function ProductList() {
  const navigate = useNavigate();
  const { products, isLoading, fetchProducts, deleteProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [variants, setVariants] = useState<Record<string, ProductVariant[]>>({});
  const [loadingVariants, setLoadingVariants] = useState<string | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantProductId, setVariantProductId] = useState<string | null>(null);
  const [variantForm, setVariantForm] = useState({
    sku: '',
    name: '',
    attributes: '' as string,
    price: '',
    costPrice: '',
    stock: '',
    barcode: '',
  });
  const [savingVariant, setSavingVariant] = useState(false);

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

  const toggleVariants = async (productId: string) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null);
      return;
    }
    setExpandedProductId(productId);
    if (!variants[productId]) {
      setLoadingVariants(productId);
      try {
        const { data } = await api.get(`/inventory/products/${productId}/variants`);
        setVariants((prev) => ({ ...prev, [productId]: data || [] }));
      } catch {
        setVariants((prev) => ({ ...prev, [productId]: [] }));
      } finally {
        setLoadingVariants(null);
      }
    }
  };

  const openAddVariant = (productId: string) => {
    setVariantProductId(productId);
    setVariantForm({ sku: '', name: '', attributes: '', price: '', costPrice: '', stock: '', barcode: '' });
    setShowVariantModal(true);
  };

  const handleSaveVariant = async () => {
    if (!variantProductId) return;
    if (!variantForm.sku || !variantForm.name) {
      toast.error('SKU and Name are required');
      return;
    }
    setSavingVariant(true);
    try {
      let parsedAttributes: Record<string, string> = {};
      if (variantForm.attributes.trim()) {
        try {
          parsedAttributes = JSON.parse(variantForm.attributes);
        } catch {
          // try parsing as key=value pairs
          variantForm.attributes.split(',').forEach((pair) => {
            const [key, ...rest] = pair.split(':');
            if (key && rest.length) {
              parsedAttributes[key.trim()] = rest.join(':').trim();
            }
          });
        }
      }
      const payload = {
        sku: variantForm.sku,
        name: variantForm.name,
        attributes: parsedAttributes,
        price: variantForm.price ? Number(variantForm.price) : undefined,
        costPrice: variantForm.costPrice ? Number(variantForm.costPrice) : undefined,
        stock: variantForm.stock ? Number(variantForm.stock) : undefined,
        barcode: variantForm.barcode || undefined,
      };
      await api.post(`/inventory/products/${variantProductId}/variants`, payload);
      toast.success('Variant created');
      setShowVariantModal(false);
      // Refresh variants
      const { data } = await api.get(`/inventory/products/${variantProductId}/variants`);
      setVariants((prev) => ({ ...prev, [variantProductId]: data || [] }));
    } catch {
      toast.error('Failed to create variant');
    } finally {
      setSavingVariant(false);
    }
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
                <th className="table-header">Variants</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((p) => {
                const qty = Number(p.stockQuantity || 0);
                const reorder = Number(p.reorderPoint || 0);
                const isLowStock = reorder > 0 && qty <= reorder;
                const isExpanded = expandedProductId === p.id;
                const productVariants = variants[p.id];
                return (
                  <Fragment key={p.id}>
                    <tr className={`hover:bg-gray-50 ${isLowStock ? 'bg-red-50/50' : ''}`}>
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
                        <button
                          onClick={() => toggleVariants(p.id)}
                          className="flex items-center gap-1 text-sm text-primary-600 hover:underline"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          Manage
                        </button>
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
                    {isExpanded && (
                      <tr key={`${p.id}-variants`}>
                        <td colSpan={10} className="bg-gray-50 px-6 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">Variants for {p.name}</h3>
                            <button
                              onClick={() => openAddVariant(p.id)}
                              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Variant
                            </button>
                          </div>
                          {loadingVariants === p.id ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            </div>
                          ) : !productVariants || productVariants.length === 0 ? (
                            <p className="text-sm text-gray-400 py-4">No variants yet. Click "Add Variant" to create one.</p>
                          ) : (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="table-header text-xs">SKU</th>
                                    <th className="table-header text-xs">Name</th>
                                    <th className="table-header text-xs">Attributes</th>
                                    <th className="table-header text-xs">Price</th>
                                    <th className="table-header text-xs">Stock</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {productVariants.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50">
                                      <td className="table-cell font-mono text-xs">{v.sku}</td>
                                      <td className="table-cell text-sm">{v.name}</td>
                                      <td className="table-cell text-xs text-gray-500">
                                        {Object.keys(v.attributes || {}).length > 0
                                          ? Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(', ')
                                          : '—'}
                                      </td>
                                      <td className="table-cell text-sm font-medium">
                                        ₦{Number(v.price || 0).toLocaleString()}
                                      </td>
                                      <td className="table-cell text-sm">{v.stock ?? 0}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
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

      {showVariantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Variant</h2>
              <button onClick={() => setShowVariantModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm((f) => ({ ...f, sku: e.target.value }))}
                    className="input w-full"
                    placeholder="e.g. PROD-RED-L"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={variantForm.name}
                    onChange={(e) => setVariantForm((f) => ({ ...f, name: e.target.value }))}
                    className="input w-full"
                    placeholder="e.g. Red, Large"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attributes (JSON or key:value pairs)</label>
                <textarea
                  value={variantForm.attributes}
                  onChange={(e) => setVariantForm((f) => ({ ...f, attributes: e.target.value }))}
                  className="input w-full"
                  rows={2}
                  placeholder='{"color": "Red", "size": "L"} or color: Red, size: L'
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    value={variantForm.price}
                    onChange={(e) => setVariantForm((f) => ({ ...f, price: e.target.value }))}
                    className="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                  <input
                    type="number"
                    value={variantForm.costPrice}
                    onChange={(e) => setVariantForm((f) => ({ ...f, costPrice: e.target.value }))}
                    className="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={variantForm.stock}
                    onChange={(e) => setVariantForm((f) => ({ ...f, stock: e.target.value }))}
                    className="input w-full"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <input
                  type="text"
                  value={variantForm.barcode}
                  onChange={(e) => setVariantForm((f) => ({ ...f, barcode: e.target.value }))}
                  className="input w-full"
                  placeholder="Optional barcode"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200">
              <button onClick={() => setShowVariantModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveVariant} disabled={savingVariant} className="btn-primary flex items-center gap-2">
                {savingVariant && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Variant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
