import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { api } from '../services/api';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const notifs = await api.getNotifications();
      const unread = notifs.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (action: string) => {
    if (action === 'case') {
      navigate('/cases?action=new');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <Sidebar unreadCount={unreadCount} />
      <Topbar onQuickAction={handleQuickAction} unreadCount={unreadCount} />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
