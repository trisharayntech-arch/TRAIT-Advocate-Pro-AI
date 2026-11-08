import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Key,
  Server,
  LogOut,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { user, refreshProfile, logout } = useAuth();
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    bar_enrollment_number: '',
    law_firm: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        bar_enrollment_number: user.bar_enrollment_number || '',
        law_firm: user.law_firm || '',
      });
    }

    api.getSystemSettings().then(setSystemSettings).catch(() => {});
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await api.updateMe(profileForm);
      await refreshProfile();
      setProfileMsg('Profile details successfully updated.');
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMsg('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      await api.updateMe({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordMsg('Password changed successfully.');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setPasswordMsg(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-[#2563EB]" />
          Chamber & Security Settings
        </h1>
        <p className="text-xs text-[#8290A5] mt-1 font-medium">
          Manage advocate credentials, chamber details, security passwords, and inspect AI engine status.
        </p>
      </div>

      {/* Profile Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
          <User className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-[#172033]">Advocate Profile & Chamber Information</h2>
        </div>

        {profileMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              profileMsg.includes('success')
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {profileMsg.includes('success') ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{profileMsg}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Official Email</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-100 border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#8290A5] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Bar Council Enrollment Number
              </label>
              <input
                type="text"
                value={profileForm.bar_enrollment_number}
                onChange={(e) => setProfileForm({ ...profileForm, bar_enrollment_number: e.target.value })}
                placeholder="e.g. D/1054/2014"
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Law Firm / Chamber Office
              </label>
              <input
                type="text"
                value={profileForm.law_firm}
                onChange={(e) => setProfileForm({ ...profileForm, law_firm: e.target.value })}
                placeholder="e.g. TRAIT Innovation Law Chambers"
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
          <Key className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-[#172033]">Security & Password</h2>
        </div>

        {passwordMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              passwordMsg.includes('success')
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <span>{passwordMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2 text-xs font-bold text-white bg-[#101A2C] hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* System Diagnostics & AI Provider Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
          <Server className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-[#172033]">Platform Architecture & Status</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[#8290A5] block text-[10px] uppercase font-bold tracking-wider">
              Product Version
            </span>
            <span className="font-bold text-[#172033] mt-1 block">
              {systemSettings?.product_name || 'TRAIT Advocate Pro AI'} v{systemSettings?.version || '1.0.0'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[#8290A5] block text-[10px] uppercase font-bold tracking-wider">
              Database Backend
            </span>
            <span className="font-bold text-[#172033] mt-1 block">
              {systemSettings?.database_type || 'PostgreSQL (Neon-Compatible)'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[#8290A5] block text-[10px] uppercase font-bold tracking-wider">
              AI Operational Mode
            </span>
            <span className="font-bold text-emerald-600 mt-1 block capitalize">
              {systemSettings?.ai_status?.mode === 'live_ai'
                ? '● Live Neural AI Engine'
                : '● Rule-Based Jurisprudence Engine'}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-[#8290A5]">Ready to exit your current session?</span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out of Chamber
          </button>
        </div>
      </div>
    </div>
  );
};
