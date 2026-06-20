import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import api from '../api/client';
import { MapPin, ChevronDown, LogOut, Settings, Building2, Plus } from 'lucide-react';

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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setShowLocDropdown(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-30">
      {/* Left: Org name + Location selector */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 truncate">
          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{orgName || 'CopiaOS'}</span>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Location selector — always visible */}
        <div className="relative" ref={locRef}>
          <button
            onClick={() => setShowLocDropdown(!showLocDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-primary-600" />
            <span className="max-w-[140px] truncate">{locationName || 'All Locations'}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {showLocDropdown && (
            <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto">
              <button
                onClick={() => { setLocation(null, null); setShowLocDropdown(false); }}
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${!locationId ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  All Locations
                </div>
              </button>
              {locations.length > 0 && (
                <div className="border-t border-gray-100">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => { setLocation(loc.id, loc.name); setShowLocDropdown(false); }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${locationId === loc.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <div className="min-w-0">
                          <p className="truncate">{loc.name}</p>
                          {loc.city && <p className="text-xs text-gray-400 truncate">{loc.city}</p>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {locations.length === 0 && (
                <div className="border-t border-gray-100 px-3 py-3">
                  <p className="text-xs text-gray-400 mb-2">No locations created yet</p>
                  <button
                    onClick={() => { setShowLocDropdown(false); navigate('/settings/locations'); }}
                    className="w-full flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Create Location
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: User menu */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold">
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
