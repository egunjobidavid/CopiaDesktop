import { AlertTriangle, RefreshCw } from 'lucide-react';

interface MaintenanceScreenProps {
  message: string;
  onRetry?: () => void;
}

export function MaintenanceScreen({ message, onRetry }: MaintenanceScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Under Maintenance</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        )}
      </div>
    </div>
  );
}
