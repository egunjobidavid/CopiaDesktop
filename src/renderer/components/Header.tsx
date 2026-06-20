import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import api from '../api/client';
import { MapPin, ChevronDown, Bell, Search, LogOut, User, Settings, Building2 } from 'lucide-react';

interface LocationOption {
  id: string;
  name: string;
  city: string | null;
  type: string | null;
}

export function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);
  const locationId = useAuthStore((s) => s.locationId);
  const locationName = useAuthStore((s) => s.locationName);
  const setLocation = useAuthStore((s) => s.setLocation);
  const logout = useAuthStore((s) => s.logout);

  const [orgName, setOrgName] = useState('');
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [showLocDropdown, setShowLocDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const locRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tenantId) {
      api.get('/auth/me').then(({ data }) => {
        if (data?.tenants?.length > 0) {
          const t = data.tenants.find((t: any) => t.id === tenantId);
          if (t) setOrgName(t.name);
        }
      }).catch(() => {});
    }
  }, [tenantId]);

  useEffect(() => {
    api.get('/locations').then(({ data }) => {
      setLocations(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setShowLocDropdown(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: Org name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 truncate">
          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{orgName || 'CopiaOS'}</span>
        </div>

        {/* Location selector */}
        {locations.length > 0 && (
          <div className="relative" ref={locRef}>
            <button
              onClick={() => setShowLocDropdown(!showLocDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-primary-600" />
              <span className="max-w-[120px] truncate">{locationName || 'All Locations'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {showLocDropdown && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                <button
                  onClick={() => { setLocation(null, null); setShowLocDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${!locationId ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
                >
                  All Locations
                </button>
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => { setLocation(loc.id, loc.name); setShowLocDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${locationId === loc.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{loc.name}</span>
                    </div>
                    {loc.city && <span className="text-xs text-gray-400 ml-5">{loc.city}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Search + User menu */}
      <div className="flex items-center gap-2">
        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold">
              {(user?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">{user?.fullName || 'User'}</p>
              <p className="text-[11px] text-gray-500 leading-tight">{user?.role || 'Staff'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showUserMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
