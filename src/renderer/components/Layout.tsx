import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
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
      <main className="flex-1 overflow-auto">
        {isOffline && (
          <div className="bg-yellow-500 text-white text-center text-sm py-1 px-4 font-medium">
            You are offline — changes will sync when reconnected
          </div>
        )}
        {locationId && (
          <div className="bg-blue-50 border-b border-blue-200 text-blue-700 text-sm py-2 px-4 flex items-center gap-2 font-medium">
            <MapPin className="w-4 h-4" />
            <span>Viewing: {locationName}</span>
          </div>
        )}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
