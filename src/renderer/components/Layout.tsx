import { useState, useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SearchModal } from './SearchModal';
import { TrialBanner } from './TrialBanner';
import { useOffline } from '../hooks/useOffline';

export function Layout() {
  const { isOffline } = useOffline();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onSearchOpen={() => setSearchOpen(true)} />
        <main className="flex-1 overflow-auto">
          {isOffline && (
            <div className="bg-amber-500 text-white text-center text-sm py-1 px-4 font-medium">
              You are offline — changes will sync when reconnected
            </div>
          )}
          <div className="p-6">
            <TrialBanner />
            <Suspense fallback={
              <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
              </div>
            }>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
