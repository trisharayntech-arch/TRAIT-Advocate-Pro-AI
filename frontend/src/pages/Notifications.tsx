import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Calendar,
  FileText,
  Briefcase,
  Info,
  Trash2,
  Check
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
      // ignore
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
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'hearing_reminder':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'document_update':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'case_update':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#2563EB]" />
            Chamber Notifications
          </h1>
          <p className="text-xs text-[#8290A5] mt-1 font-medium">
            Reminders for upcoming hearings, document indexing confirmations, and case updates.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-[#172033] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-[#2563EB]" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#8290A5]">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.is_read) handleMarkAsRead(n.id);
                  if (n.link) navigate(n.link);
                }}
                className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  n.is_read ? 'hover:bg-slate-50/70' : 'bg-blue-50/30 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.is_read ? 'bg-slate-100' : 'bg-blue-100 shadow-xs'
                    }`}
                  >
                    {getIconForType(n.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#172033]">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100"></span>
                      )}
                    </div>
                    <p className="text-xs text-[#8290A5] mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1.5 block">
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
                    className="p-1.5 text-slate-400 hover:text-[#2563EB] hover:bg-blue-100/50 rounded-lg transition-colors"
                    title="Mark as Read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#172033]">All caught up</h3>
            <p className="text-xs text-[#8290A5] mt-1 max-w-xs mx-auto">
              You will receive automatic alerts when court dates approach or files finish indexing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
