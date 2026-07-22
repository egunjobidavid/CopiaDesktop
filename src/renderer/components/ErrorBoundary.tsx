import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  private retryCount = 0;

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary]', error, errorInfo);
    if (this.retryCount < 2) {
      this.retryCount++;
      setTimeout(() => this.setState({ hasError: false, error: null }), 50);
    }
  }

  handleRetry = () => {
    this.retryCount = 0;
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleCopyError = () => {
    const info = `${this.state.error?.name}: ${this.state.error?.message}\n${this.state.error?.stack}`;
    navigator.clipboard.writeText(info).then(() => {
      toast.success('Error details copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy error details');
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
          <div className="flex gap-2">
            <button onClick={this.handleRetry} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button onClick={this.handleGoHome} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
            <button onClick={this.handleCopyError} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2" title="Copy error details for support">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
