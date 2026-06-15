import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem }: CartProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-sm">Cart is empty</p>
          <p className="text-xs mt-1">Search and select products to start</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
      {items.map((item) => (
        <div key={item.productId} className="px-4 py-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">{item.sku}</p>
            </div>
            <button
              onClick={() => onRemoveItem(item.productId)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.productId, -1)}
                disabled={item.quantity <= 1}
                className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.productId, 1)}
                className="p-1 rounded border border-gray-300 hover:bg-gray-50"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                ₦{item.lineTotal.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                ₦{item.unitPrice.toLocaleString()} ea
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
