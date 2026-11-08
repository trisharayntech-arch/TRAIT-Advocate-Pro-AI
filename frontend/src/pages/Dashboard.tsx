import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileText,
  Clock,
  PlusCircle,
  Bot,
  PenTool,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Chamber Banner */}
      <div className="bg-[#101A2C] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-[#1E2E4A]">
        <div className="absolute right-0 top-0 w-96 h-full bg-linear-to-l from-[#2563EB]/25 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chamber Workspace • Indian Jurisdiction</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {user?.full_name || 'Advocate'}
            </h1>
            <p className="text-sm text-[#8290A5] mt-1 max-w-xl">
              {user?.law_firm ? `${user.law_firm} • ` : ''}
              {user?.bar_enrollment_number ? `Bar Reg: ${user.bar_enrollment_number} • ` : ''}
              Access your real-time cases, client dossiers, and automated legal drafting.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/cases?action=new')}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/30 transition-all cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              New Case
            </button>
            <button
              onClick={() => navigate('/clients?action=new')}
              className="px-4 py-2 bg-[#18263E] hover:bg-[#233554] text-white border border-[#2A3E60] rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              Add Client
            </button>
            <button
              onClick={() => navigate('/drafting')}
              className="px-4 py-2 bg-[#18263E] hover:bg-[#233554] text-white border border-[#2A3E60] rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              Draft Notice
            </button>
            <button
              onClick={() => navigate('/assistant')}
              className="px-4 py-2 bg-[#18263E] hover:bg-[#233554] text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              Ask AI
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8290A5] uppercase tracking-wider">Total Clients</p>
            <h3 className="text-2xl font-black text-[#172033] mt-1">
              {loading ? '-' : stats?.total_clients ?? 0}
            </h3>
            <p className="text-[11px] text-[#2563EB] font-medium mt-1 flex items-center gap-1">
              <span>Verified Profiles</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8290A5] uppercase tracking-wider">Active Cases</p>
            <h3 className="text-2xl font-black text-[#172033] mt-1">
              {loading ? '-' : stats?.active_cases ?? 0}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {stats?.total_cases ?? 0} Total Filed
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8290A5] uppercase tracking-wider">Documents Indexed</p>
            <h3 className="text-2xl font-black text-[#172033] mt-1">
              {loading ? '-' : stats?.total_documents ?? 0}
            </h3>
            <p className="text-[11px] text-[#8290A5] font-medium mt-1">PDF & DOCX Indexed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8290A5] uppercase tracking-wider">Legal Drafts</p>
            <h3 className="text-2xl font-black text-[#172033] mt-1">
              {loading ? '-' : stats?.total_drafts ?? 0}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Ready for Review</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <PenTool className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Hearings + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Hearings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#172033]">Upcoming Court Hearings</h2>
            </div>
            <button
              onClick={() => navigate('/cases')}
              className="text-xs font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-1"
            >
              View All Cases
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats?.upcoming_hearings && stats.upcoming_hearings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-[#8290A5] uppercase tracking-wider">
                    <th className="pb-3 px-2">Case No. & Title</th>
                    <th className="pb-3 px-2">Court</th>
                    <th className="pb-3 px-2">Client</th>
                    <th className="pb-3 px-2 text-right">Hearing Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {stats.upcoming_hearings.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-bold text-[#172033]">{h.case_number}</div>
                        <div className="text-[#8290A5] text-[11px] truncate max-w-xs">{h.title}</div>
                      </td>
                      <td className="py-3 px-2 text-[#172033] font-medium">{h.court_name}</td>
                      <td className="py-3 px-2 text-[#8290A5]">{h.client_name || '—'}</td>
                      <td className="py-3 px-2 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-[#2563EB] font-bold text-[11px]">
                          <Clock className="w-3 h-3" />
                          {h.next_hearing_date}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#8290A5]">No upcoming court hearings scheduled</p>
              <button
                onClick={() => navigate('/cases?action=new')}
                className="mt-3 text-xs font-bold text-[#2563EB] hover:underline"
              >
                + Schedule Next Hearing
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[#172033]">Recent Chamber Activity</h2>
            <button
              onClick={() => navigate('/notifications')}
              className="text-xs font-bold text-[#2563EB] hover:text-blue-700"
            >
              History
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {stats?.recent_activities && stats.recent_activities.length > 0 ? (
              stats.recent_activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    •
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#172033] leading-tight">{act.title}</p>
                    <p className="text-[11px] text-[#8290A5] line-clamp-2 mt-0.5">{act.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-[#8290A5] text-xs">
                No recorded actions yet. Start by creating a client or case.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
