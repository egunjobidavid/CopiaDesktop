import { useState } from 'react';
import { useProducts, Product } from '../../hooks/useProducts';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const { createProduct, updateProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    unitPrice: product?.unitPrice || '',
    productType: product?.productType || 'finished_good',
    uom: product?.uom || 'pcs',
    isActive: product?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.sku.trim() || !form.name.trim() || !form.unitPrice) {
      toast.error('SKU, Name, and Price are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (product) {
        await updateProduct(product.id, form);
      } else {
        await createProduct(form);
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {product ? 'Edit Product' : 'New Product'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">SKU *</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                className="input"
                placeholder="e.g. PRD-001"
                required
              />
            </div>
            <div>
              <label className="label">Unit of Measure</label>
              <select
                value={form.uom}
                onChange={(e) => updateField('uom', e.target.value)}
                className="input"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="l">Litres (l)</option>
                <option value="ml">Millilitres (ml)</option>
                <option value="m">Meters (m)</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Product Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="input"
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="input min-h-[80px] resize-y"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Unit Price (₦) *</label>
              <input
                type="number"
                value={form.unitPrice}
                onChange={(e) => updateField('unitPrice', e.target.value)}
                className="input"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="label">Product Type</label>
              <select
                value={form.productType}
                onChange={(e) => updateField('productType', e.target.value)}
                className="input"
              >
                <option value="finished_good">Finished Good</option>
                <option value="raw_material">Raw Material</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => updateField('isActive', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
