import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Calendar,
  FileText,
  Briefcase,
  Info,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { NotificationItem } from '../types';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // Preserve existing behavior.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch {
      // Preserve existing behavior.
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch {
      // Preserve existing behavior.
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'hearing_reminder':
        return <Calendar className="w-4 h-4 text-[#D18A32]" />;

      case 'document_update':
        return <FileText className="w-4 h-4 text-[#476B3F]" />;

      case 'case_update':
        return <Briefcase className="w-4 h-4 text-[#53602F]" />;

      default:
        return <Info className="w-4 h-4 text-[#9A641F]" />;
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-black text-[#34452F] tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#EAA34B]" />
            Chamber Notifications
          </h1>

          <p className="text-xs text-[#7D806B] mt-1 font-medium">
            Reminders for upcoming hearings, document indexing confirmations,
            and case updates.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFFCF5] border border-[#E9DCC6] hover:bg-[#F8EFDF] text-[#34452F] text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-[#476B3F]" />
            Mark All as Read
          </button>
        )}

      </div>

      {/* Notifications Card */}
      <div className="bg-[#FFFCF5] rounded-2xl border border-[#E9DCC6] shadow-sm overflow-hidden">

        {loading ? (
          <div className="p-12 text-center text-xs text-[#7D806B]">
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (

          <div className="divide-y divide-[#E9DCC6]">

            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.is_read) handleMarkAsRead(n.id);
                  if (n.link) navigate(n.link);
                }}
                className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  n.is_read
                    ? 'hover:bg-[#F8EFDF]/60'
                    : 'bg-[#EAA34B]/[0.07] hover:bg-[#EAA34B]/[0.12]'
                }`}
              >

                <div className="flex items-start gap-3.5 min-w-0">

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.is_read
                        ? 'bg-[#F8EFDF]'
                        : 'bg-[#EAA34B]/20 shadow-sm'
                    }`}
                  >
                    {getIconForType(n.type)}
                  </div>

                  <div className="min-w-0">

                    <div className="flex items-center gap-2 flex-wrap">

                      <h4 className="text-xs font-bold text-[#34452F]">
                        {n.title}
                      </h4>

                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#D18A32] ring-2 ring-[#EAA34B]/20" />
                      )}

                    </div>

                    <p className="text-xs text-[#7D806B] mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    <span className="text-[10px] text-[#A29B87] mt-2 block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>

                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(n.id);
                    }}
                    className="p-2 text-[#7D806B] hover:text-[#476B3F] hover:bg-[#476B3F]/10 rounded-lg transition-colors shrink-0"
                    title="Mark as Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}

              </div>
            ))}

          </div>

        ) : (

          <div className="text-center py-16 px-5">

            <div className="w-16 h-16 rounded-2xl bg-[#F8EFDF] flex items-center justify-center mx-auto mb-3">
              <Bell className="w-8 h-8 text-[#D18A32]" />
            </div>

            <h3 className="text-sm font-bold text-[#34452F]">
              All caught up
            </h3>

            <p className="text-xs text-[#7D806B] mt-1 max-w-xs mx-auto leading-relaxed">
              You will receive automatic alerts when court dates approach
              or files finish indexing.
            </p>

          </div>

        )}

      </div>
    </div>
  );
};