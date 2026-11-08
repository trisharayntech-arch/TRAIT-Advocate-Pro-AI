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
  AlertCircle,
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

      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      setPasswordMsg(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass =
    'w-full bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl px-3.5 py-2.5 text-xs text-[#34452F] placeholder:text-[#A29B87] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#EAA34B] transition-all';

  const labelClass =
    'block text-xs font-semibold text-[#34452F] mb-1.5';

  const cardClass =
    'bg-[#FFFCF5] rounded-2xl border border-[#E9DCC6] p-6 shadow-sm';

  const sectionHeadingClass =
    'text-sm font-bold text-[#34452F]';

  const messageClass = (message: string) =>
    `mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
      message.includes('success')
        ? 'bg-[#476B3F]/10 text-[#476B3F] border border-[#476B3F]/20'
        : 'bg-[#FCEAE3] text-[#BD4118] border border-[#E9B9A7]'
    }`;

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#34452F] tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-[#EAA34B]" />
          Chamber & Security Settings
        </h1>

        <p className="text-xs text-[#7D806B] mt-1 font-medium">
          Manage advocate credentials, chamber details, security passwords,
          and inspect AI engine status.
        </p>
      </div>

      {/* Profile Details */}
      <div className={cardClass}>

        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#E9DCC6]">
          <User className="w-4 h-4 text-[#D18A32]" />
          <h2 className={sectionHeadingClass}>
            Advocate Profile & Chamber Information
          </h2>
        </div>

        {profileMsg && (
          <div className={messageClass(profileMsg)}>
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
              <label className={labelClass}>Full Name</label>

              <input
                type="text"
                required
                value={profileForm.full_name}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    full_name: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Official Email</label>

              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#F8EFDF] border border-[#E9DCC6] rounded-xl px-3.5 py-2.5 text-xs text-[#A29B87] cursor-not-allowed"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className={labelClass}>
                Bar Council Enrollment Number
              </label>

              <input
                type="text"
                value={profileForm.bar_enrollment_number}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    bar_enrollment_number: e.target.value,
                  })
                }
                placeholder="e.g. D/1054/2014"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Law Firm / Chamber Office
              </label>

              <input
                type="text"
                value={profileForm.law_firm}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    law_firm: e.target.value,
                  })
                }
                placeholder="e.g. TRAIT Innovation Law Chambers"
                className={inputClass}
              />
            </div>

          </div>

          <div>
            <label className={labelClass}>Phone Number</label>

            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  phone: e.target.value,
                })
              }
              placeholder="Enter phone number"
              className={inputClass}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#476B3F] hover:bg-[#34452F] rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

        </form>
      </div>

      {/* Password Change */}
      <div className={cardClass}>

        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#E9DCC6]">
          <Key className="w-4 h-4 text-[#D18A32]" />
          <h2 className={sectionHeadingClass}>
            Security & Password
          </h2>
        </div>

        {passwordMsg && (
          <div className={messageClass(passwordMsg)}>
            {passwordMsg.includes('success') ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>
              <label className={labelClass}>Current Password</label>

              <input
                type="password"
                required
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>New Password</label>

              <input
                type="password"
                required
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Confirm New Password</label>

              <input
                type="password"
                required
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 text-xs font-bold text-[#34452F] bg-[#EAA34B] hover:bg-[#D18A32] rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>

        </form>
      </div>

      {/* Platform Diagnostics */}
      <div className={cardClass}>

        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#E9DCC6]">
          <Server className="w-4 h-4 text-[#D18A32]" />
          <h2 className={sectionHeadingClass}>
            Platform Architecture & Status
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">

          <div className="p-4 rounded-xl bg-[#F8EFDF] border border-[#E9DCC6]">
            <span className="text-[#7D806B] block text-[10px] uppercase font-bold tracking-wider">
              Product Version
            </span>

            <span className="font-bold text-[#34452F] mt-2 block">
              {systemSettings?.product_name || 'TRAIT Advocate Pro AI'} v
              {systemSettings?.version || '1.0.0'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8EFDF] border border-[#E9DCC6]">
            <span className="text-[#7D806B] block text-[10px] uppercase font-bold tracking-wider">
              Database Backend
            </span>

            <span className="font-bold text-[#34452F] mt-2 block">
              {systemSettings?.database_type || 'PostgreSQL (Neon-Compatible)'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8EFDF] border border-[#E9DCC6]">
            <span className="text-[#7D806B] block text-[10px] uppercase font-bold tracking-wider">
              AI Operational Mode
            </span>

            <span className="font-bold text-[#476B3F] mt-2 block capitalize">
              {systemSettings?.ai_status?.mode === 'live_ai'
                ? '● Live Neural AI Engine'
                : '● Rule-Based Jurisprudence Engine'}
            </span>
          </div>

        </div>

        {/* Sign Out */}
        <div className="mt-6 pt-5 border-t border-[#E9DCC6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#476B3F]" />
            <span className="text-xs text-[#7D806B]">
              Ready to exit your current session?
            </span>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#BD4118] bg-[#FCEAE3] hover:bg-[#F8DCCF] rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out of Chamber
          </button>

        </div>

      </div>
    </div>
  );
};