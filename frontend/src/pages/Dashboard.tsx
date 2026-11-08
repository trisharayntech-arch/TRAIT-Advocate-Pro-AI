import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileText,
  Clock,
  Bot,
  PenTool,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
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

      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-[#34452F] via-[#476B3F] to-[#53602F] rounded-2xl p-6 sm:p-8 text-[#FFF8EC] relative overflow-hidden shadow-xl border border-[#53602F]">

        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-[#EAA34B]/20 to-transparent pointer-events-none" />

        <div className="absolute -right-16 -bottom-32 w-80 h-80 rounded-full border border-[#EAA34B]/15 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAA34B]/20 text-[#FFD99A] text-xs font-semibold mb-3 border border-[#EAA34B]/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chamber Workspace • Indian Jurisdiction</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#FFF8EC]">
              Welcome, {user?.full_name || 'Advocate'}
            </h1>

            <p className="text-sm text-[#E5E8D9] mt-2 max-w-xl">
              {user?.law_firm ? `${user.law_firm} • ` : ''}
              {user?.bar_enrollment_number
                ? `Bar Reg: ${user.bar_enrollment_number} • `
                : ''}
              Access your real-time cases, client dossiers, and automated legal drafting.
            </p>

          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2.5">

            <button
              onClick={() => navigate('/cases?action=new')}
              className="px-4 py-2 bg-[#EAA34B] hover:bg-[#E8B85B] text-[#34452F] rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              New Case
            </button>

            <button
              onClick={() => navigate('/clients?action=new')}
              className="px-4 py-2 bg-[#34452F]/50 hover:bg-[#263A2B] text-[#FFF8EC] border border-[#D7DCCB]/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              Add Client
            </button>

            <button
              onClick={() => navigate('/drafting')}
              className="px-4 py-2 bg-[#34452F]/50 hover:bg-[#263A2B] text-[#FFF8EC] border border-[#D7DCCB]/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              Draft Notice
            </button>

            <button
              onClick={() => navigate('/assistant')}
              className="px-4 py-2 bg-[#D94F1E] hover:bg-[#BD4118] text-white border border-[#E9824A]/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              Ask AI
            </button>

          </div>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FCEAE3] border border-[#E8B8A5] text-[#C84632] text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* TOTAL CLIENTS */}
        <div className="bg-[#FFFCF5] rounded-2xl p-5 border border-[#E9DCC6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7D806B] uppercase tracking-wider">
              Total Clients
            </p>

            <h3 className="text-2xl font-black text-[#34452F] mt-1">
              {loading ? '-' : stats?.total_clients ?? 0}
            </h3>

            <p className="text-[11px] text-[#53602F] font-medium mt-1">
              Verified Profiles
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#53602F]/10 text-[#53602F] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* ACTIVE CASES */}
        <div className="bg-[#FFFCF5] rounded-2xl p-5 border border-[#E9DCC6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7D806B] uppercase tracking-wider">
              Active Cases
            </p>

            <h3 className="text-2xl font-black text-[#34452F] mt-1">
              {loading ? '-' : stats?.active_cases ?? 0}
            </h3>

            <p className="text-[11px] text-[#476B3F] font-medium mt-1">
              {stats?.total_cases ?? 0} Total Filed
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#476B3F]/10 text-[#476B3F] flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="bg-[#FFFCF5] rounded-2xl p-5 border border-[#E9DCC6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7D806B] uppercase tracking-wider">
              Documents Indexed
            </p>

            <h3 className="text-2xl font-black text-[#34452F] mt-1">
              {loading ? '-' : stats?.total_documents ?? 0}
            </h3>

            <p className="text-[11px] text-[#7D806B] font-medium mt-1">
              PDF & DOCX Indexed
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#E9824A]/15 text-[#D94F1E] flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* LEGAL DRAFTS */}
        <div className="bg-[#FFFCF5] rounded-2xl p-5 border border-[#E9DCC6] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7D806B] uppercase tracking-wider">
              Legal Drafts
            </p>

            <h3 className="text-2xl font-black text-[#34452F] mt-1">
              {loading ? '-' : stats?.total_drafts ?? 0}
            </h3>

            <p className="text-[11px] text-[#D94F1E] font-medium mt-1">
              Ready for Review
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#EAA34B]/15 text-[#D18A32] flex items-center justify-center">
            <PenTool className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* HEARINGS AND ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* UPCOMING HEARINGS */}
        <div className="lg:col-span-2 bg-[#FFFCF5] rounded-2xl border border-[#E9DCC6] p-6 shadow-sm">

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-2.5">

              <div className="w-8 h-8 rounded-lg bg-[#53602F]/10 text-[#53602F] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>

              <h2 className="text-base font-bold text-[#34452F]">
                Upcoming Court Hearings
              </h2>

            </div>

            <button
              onClick={() => navigate('/cases')}
              className="text-xs font-bold text-[#53602F] hover:text-[#D94F1E] flex items-center gap-1"
            >
              View All Cases
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

          </div>

          {stats?.upcoming_hearings && stats.upcoming_hearings.length > 0 ? (

            <div className="overflow-x-auto">

              <table className="w-full text-left border-collapse">

                <thead>
                  <tr className="border-b border-[#E9DCC6] text-[11px] font-bold text-[#7D806B] uppercase tracking-wider">

                    <th className="pb-3 px-2">Case No. & Title</th>
                    <th className="pb-3 px-2">Court</th>
                    <th className="pb-3 px-2">Client</th>
                    <th className="pb-3 px-2 text-right">Hearing Date</th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E9DCC6] text-xs">

                  {stats.upcoming_hearings.map((h, i) => (

                    <tr key={i} className="hover:bg-[#F8EFDF] transition-colors">

                      <td className="py-3 px-2">

                        <div className="font-bold text-[#34452F]">
                          {h.case_number}
                        </div>

                        <div className="text-[#7D806B] text-[11px] truncate max-w-xs">
                          {h.title}
                        </div>

                      </td>

                      <td className="py-3 px-2 text-[#34452F] font-medium">
                        {h.court_name}
                      </td>

                      <td className="py-3 px-2 text-[#7D806B]">
                        {h.client_name || '—'}
                      </td>

                      <td className="py-3 px-2 text-right">

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EAA34B]/20 text-[#53602F] font-bold text-[11px]">
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

            <div className="text-center py-12 border-2 border-dashed border-[#E9DCC6] rounded-xl">

              <Clock className="w-8 h-8 text-[#B7B69D] mx-auto mb-2" />

              <p className="text-xs font-semibold text-[#7D806B]">
                No upcoming court hearings scheduled
              </p>

              <button
                onClick={() => navigate('/cases?action=new')}
                className="mt-3 text-xs font-bold text-[#D94F1E] hover:underline"
              >
                + Schedule Next Hearing
              </button>

            </div>

          )}

        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-[#FFFCF5] rounded-2xl border border-[#E9DCC6] p-6 shadow-sm flex flex-col">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-base font-bold text-[#34452F]">
              Recent Chamber Activity
            </h2>

            <button
              onClick={() => navigate('/notifications')}
              className="text-xs font-bold text-[#53602F] hover:text-[#D94F1E]"
            >
              History
            </button>

          </div>

          <div className="space-y-4 flex-1">

            {stats?.recent_activities && stats.recent_activities.length > 0 ? (

              stats.recent_activities.map((act, i) => (

                <div
                  key={i}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8EFDF] transition-colors"
                >

                  <div className="w-7 h-7 rounded-lg bg-[#EAA34B]/20 text-[#53602F] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    •
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-xs font-bold text-[#34452F] leading-tight">
                      {act.title}
                    </p>

                    <p className="text-[11px] text-[#7D806B] line-clamp-2 mt-0.5">
                      {act.description}
                    </p>

                    <span className="text-[10px] text-[#A39B85] mt-1 block">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>

                  </div>

                </div>

              ))

            ) : (

              <div className="text-center py-10 text-[#7D806B] text-xs">
                No recorded actions yet. Start by creating a client or case.
              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};