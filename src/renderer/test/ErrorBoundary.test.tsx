import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';

function ThrowingComponent(): React.ReactElement {
  throw new Error('Test error');
}

function SafeComponent() {
  return <div>Safe content</div>;
}

function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error', () => {
    renderWithRouter(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders fallback UI when error occurs', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    renderWithRouter(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('resets error state on retry', async () => {
    const { rerender } = renderWithRouter(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(screen.getByText('Safe content')).toBeInTheDocument();
    });
  });
});
