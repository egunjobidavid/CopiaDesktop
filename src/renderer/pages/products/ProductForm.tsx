import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useProducts, Product } from '../../hooks/useProducts';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

interface Category {
  id: string;
  name: string;
}

export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const { createProduct, updateProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { default: api } = await import('../../api/client');
      const { data } = await api.get('/inventory/categories');
      setCategories(Array.isArray(data) ? data : data?.data || data?.rows || []);
    } catch {
      setCategories([]);
    }
  }

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      sku: product?.sku || '',
      name: product?.name || '',
      description: product?.description || '',
      unitPrice: product?.unitPrice || '',
      costPrice: product?.costPrice || '',
      productType: product?.productType || 'finished_good',
      uom: product?.uom || 'pcs',
      barcode: product?.barcode || '',
      reorderPoint: product?.reorderPoint || '',
      categoryId: product?.categoryId || '',
      isActive: product?.isActive ?? true,
    },
  });

  const onSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        reorderPoint: formData.reorderPoint ? Number(formData.reorderPoint) : undefined,
        categoryId: formData.categoryId || undefined,
      };
      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">SKU *</label>
              <input
                type="text"
                {...register('sku', { required: 'SKU is required' })}
                className="input"
                placeholder="e.g. PRD-001"
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
            </div>
            <div>
              <label className="label">Barcode</label>
              <input
                type="text"
                {...register('barcode')}
                className="input"
                placeholder="Barcode or EAN"
              />
            </div>
          </div>

          <div>
            <label className="label">Product Name *</label>
            <input
              type="text"
              {...register('name', { required: 'Product name is required' })}
              className="input"
              placeholder="Enter product name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              {...register('description')}
              className="input min-h-[80px] resize-y"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Selling Price (₦) *</label>
              <input
                type="number"
                {...register('unitPrice', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
                className="input"
                placeholder="0.00"
                step="0.01"
              />
              {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice.message}</p>}
            </div>
            <div>
              <label className="label">Cost Price (₦)</label>
              <input
                type="number"
                {...register('costPrice')}
                className="input"
                placeholder="0.00"
                step="0.01"
                min={0}
              />
            </div>
            <div>
              <label className="label">Reorder Point</label>
              <input
                type="number"
                {...register('reorderPoint')}
                className="input"
                placeholder="0"
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Product Type</label>
              <select {...register('productType')} className="input">
                <option value="finished_good">Finished Good</option>
                <option value="raw_material">Raw Material</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div>
              <label className="label">Unit of Measure</label>
              <select {...register('uom')} className="input">
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
            <label className="label">Category</label>
            <select {...register('categoryId')} className="input">
              <option value="">No Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isActive')}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label className="text-sm text-gray-700">Active</label>
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
