import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User as UserIcon, LogOut, Plus, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  onQuickAction?: (action: string) => void;
  unreadCount?: number;
}

export const Topbar: React.FC<TopbarProps> = ({ onQuickAction, unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] fixed top-0 right-0 left-64 z-20 px-8 flex items-center justify-between shadow-xs">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-96">
        <Search className="w-4 h-4 text-[#8290A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clients, cases, documents, drafts..."
          className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-lg pl-10 pr-4 py-2 text-sm text-[#172033] placeholder-[#8290A5] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Quick New Action Button */}
        {onQuickAction && (
          <div className="relative group">
            <button
              onClick={() => onQuickAction('case')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Case</span>
            </button>
          </div>
        )}

        {/* Notifications Icon */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-[#8290A5] hover:text-[#172033] hover:bg-[#F5F7FB] rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          )}
        </button>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-lg hover:bg-[#F5F7FB] border border-transparent hover:border-[#E2E8F0] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#101A2C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-[#172033] leading-tight">
                {user?.full_name || 'Advocate'}
              </div>
              <div className="text-[10px] text-[#8290A5] font-medium leading-tight">
                {user?.law_firm || user?.bar_enrollment_number || 'Legal Practitioner'}
              </div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1.5 z-40">
              <div className="px-4 py-2 border-b border-[#F1F5F9]">
                <div className="text-xs font-bold text-[#172033]">{user?.full_name}</div>
                <div className="text-[11px] text-[#8290A5] truncate">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-4 py-2 text-xs text-[#172033] hover:bg-[#F5F7FB] flex items-center gap-2 font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-[#8290A5]" />
                Profile & Settings
              </button>
              <div className="my-1 border-t border-[#F1F5F9]"></div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
