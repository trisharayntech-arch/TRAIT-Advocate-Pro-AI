import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { api } from '../services/api';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchUnread = async () => {
    try {
      const notifs = await api.getNotifications();
      const unread = notifs.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // Keep the existing count if notifications cannot be fetched.
    }
  };

  useEffect(() => {
    fetchUnread();

    const interval = setInterval(fetchUnread, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close mobile navigation whenever the route changes.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleQuickAction = (action: string) => {
    if (action === 'case') {
      setMobileMenuOpen(false);
      navigate('/cases?action=new');
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#FFF8EC]">

      {/* Sidebar */}
      <Sidebar
        unreadCount={unreadCount}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Top Navigation */}
      <Topbar
        onQuickAction={handleQuickAction}
        unreadCount={unreadCount}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      {/* Main Application Content */}
      <main className="min-h-screen bg-[#FFF8EC] pt-16 md:ml-64">
        <div className="mx-auto w-full max-w-7xl p-4 sm:p-5 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default Layout;