import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useOffline } from '../hooks/useOffline';
import { useAuthStore } from '../store/auth.store';
import { MapPin } from 'lucide-react';

export function Layout() {
  const { isOffline } = useOffline();
  const locationId = useAuthStore((s) => s.locationId);
  const locationName = useAuthStore((s) => s.locationName);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {isOffline && (
            <div className="bg-amber-500 text-white text-center text-sm py-1 px-4 font-medium">
              You are offline — changes will sync when reconnected
            </div>
          )}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
