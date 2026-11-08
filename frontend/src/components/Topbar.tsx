import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  Plus,
  Shield,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  onQuickAction?: (action: string) => void;
  unreadCount?: number;
  onMenuClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onQuickAction,
  unreadCount = 0,
  onMenuClick,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 h-16 bg-[#FFFCF5] border-b border-[#E9DCC6] px-3 sm:px-4 lg:px-8 flex items-center gap-2 sm:gap-3 shadow-[0_2px_12px_rgba(52,69,47,0.04)]">

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="flex md:hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#34452F] hover:bg-[#F8EFDF] transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Search */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex-1 min-w-0 max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D806B]" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          aria-label="Search clients, cases and documents"
          className="w-full min-w-0 bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl pl-9 sm:pl-10 pr-2 sm:pr-4 py-2.5 text-sm text-[#263522] placeholder-[#9B9B83] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#53602F] transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-5">

        {/* New Case */}
        {onQuickAction && (
          <button
            type="button"
            onClick={() => onQuickAction('case')}
            aria-label="Create new case"
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#D94F1E] px-3 sm:px-4 text-white text-xs font-semibold shadow-sm hover:bg-[#BD4118] transition-all whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Case</span>
          </button>
        )}

        {/* Notifications */}
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          title="Notifications"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#53602F] hover:text-[#D94F1E] hover:bg-[#F8EFDF] transition-all"
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#D94F1E] ring-2 ring-[#FFFCF5]" />
          )}
        </button>

        {/* Profile */}
        <div className="relative shrink-0">

          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            aria-expanded={showProfileMenu}
            aria-label="Open profile menu"
            className="flex h-10 items-center gap-1 sm:gap-2 rounded-xl px-1.5 sm:px-2.5 transition-all hover:bg-[#F8EFDF]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#476B3F] text-sm font-bold text-[#FFF8EC] shadow-sm">
              {user?.full_name ? (
                user.full_name.charAt(0).toUpperCase()
              ) : (
                <UserIcon className="h-4 w-4" />
              )}
            </div>

            <div className="hidden sm:block text-left">
              <div className="max-w-[110px] truncate text-xs font-bold leading-tight text-[#263522]">
                {user?.full_name || 'Advocate'}
              </div>

              <div className="max-w-[110px] truncate text-[10px] font-medium leading-tight text-[#7D806B]">
                {user?.law_firm || user?.bar_enrollment_number || 'Legal Practitioner'}
              </div>
            </div>

            <ChevronDown
              className={`hidden sm:block h-3.5 w-3.5 text-[#7D806B] transition-transform ${
                showProfileMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowProfileMenu(false)}
              />

              <div className="absolute right-0 z-40 mt-3 w-[min(16rem,calc(100vw-1.5rem))] animate-in fade-in slide-in-from-top-2 rounded-2xl border border-[#E9DCC6] bg-[#FFFCF5] py-2 shadow-xl duration-150">

                {/* User Details */}
                <div className="border-b border-[#E9DCC6] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#476B3F] text-sm font-bold text-[#FFF8EC]">
                      {user?.full_name ? (
                        user.full_name.charAt(0).toUpperCase()
                      ) : (
                        <UserIcon className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-[#263522]">
                        {user?.full_name || 'Advocate'}
                      </div>

                      <div className="truncate text-[11px] text-[#7D806B]">
                        {user?.email || 'Legal Practitioner'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-medium text-[#34452F] transition-colors hover:bg-[#F8EFDF]"
                >
                  <Shield className="h-4 w-4 text-[#53602F]" />
                  Profile & Settings
                </button>

                <div className="mx-3 border-t border-[#E9DCC6]" />

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-medium text-[#C84632] transition-colors hover:bg-[#FCEAE3]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>

              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;