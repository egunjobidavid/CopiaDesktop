import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useOffline } from '../hooks/useOffline';

export function Layout() {
  const { isOffline } = useOffline();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {isOffline && (
          <div className="bg-yellow-500 text-white text-center text-sm py-1 px-4 font-medium">
            You are offline — changes will sync when reconnected
          </div>
        )}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
