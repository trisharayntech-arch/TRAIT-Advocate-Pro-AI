import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Lock, Mail, User, Phone, Building, Award, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    bar_enrollment_number: '',
    phone: '',
    law_firm: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101A2C] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10 text-center">
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Scale className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">
          Create Chamber Workspace
        </h2>
        <p className="mt-1 text-xs text-[#8290A5]">
          TRAIT Advocate Pro AI • Premium Legal SaaS for Advocates & Law Firms
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-200">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8290A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Adv. Rajesh Sharma"
                    className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  Official Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8290A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="advocate@traitlaw.in"
                    className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8290A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8290A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  Bar Enrollment No.
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-[#8290A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.bar_enrollment_number}
                    onChange={(e) => setFormData({ ...formData, bar_enrollment_number: e.target.value })}
                    placeholder="D/1234/2015"
                    className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  Law Firm / Chamber
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#8290A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.law_firm}
                    onChange={(e) => setFormData({ ...formData, law_firm: e.target.value })}
                    placeholder="Sharma & Partners Law Offices"
                    className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Chamber...' : 'Create Legal Workspace'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#8290A5]">
            Already have an active chamber?{' '}
            <Link to="/login" className="font-bold text-[#2563EB] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
