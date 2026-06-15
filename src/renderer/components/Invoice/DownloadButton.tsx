import { Download } from 'lucide-react';

export function DownloadButton({
  onClick,
  disabled,
  label = 'Download PDF',
  variant = 'secondary',
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  variant?: 'primary' | 'secondary';
}) {
  const baseClasses =
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  );
}
