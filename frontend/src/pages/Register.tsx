import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  Award,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
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

  const inputClass =
    'w-full bg-[#FFF8EC] border border-[#E9DCC6] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#34452F] placeholder:text-[#A29B87] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#EAA34B] transition-all';

  const labelClass =
    'block text-xs font-semibold text-[#34452F] mb-1.5';

  const iconClass =
    'w-4 h-4 text-[#7D806B] absolute left-3.5 top-1/2 -translate-y-1/2';

  return (
    <div className="min-h-screen bg-[#34452F] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Background Decoration */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#EAA34B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#53602F]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10 text-center">

        <div className="flex justify-center items-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-[#EAA34B] flex items-center justify-center text-[#34452F] shadow-lg shadow-black/20">
            <Scale className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-[#FFF8EC] uppercase">
          Create Chamber Workspace
        </h2>

        <p className="mt-2 text-xs text-[#E9DCC6]">
          TRAIT Advocate Pro AI • Premium Legal SaaS for Advocates & Law Firms
        </p>
      </div>

      {/* Registration Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-[#FFFCF5] py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-[#E9DCC6]">

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FCEAE3] border border-[#E9B9A7] flex items-start gap-3 text-xs text-[#BD4118]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className={labelClass}>Full Name *</label>

                <div className="relative">
                  <User className={iconClass} />

                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Adv. Rajesh Sharma"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Official Email *</label>

                <div className="relative">
                  <Mail className={iconClass} />

                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="advocate@traitlaw.in"
                    className={inputClass}
                  />
                </div>
              </div>

            </div>

            {/* Password + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className={labelClass}>Password *</label>

                <div className="relative">
                  <Lock className={iconClass} />

                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>

                <div className="relative">
                  <Phone className={iconClass} />

                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                </div>
              </div>

            </div>

            {/* Enrollment + Law Firm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className={labelClass}>Bar Enrollment No.</label>

                <div className="relative">
                  <Award className={iconClass} />

                  <input
                    type="text"
                    value={formData.bar_enrollment_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bar_enrollment_number: e.target.value,
                      })
                    }
                    placeholder="D/1234/2015"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Law Firm / Chamber</label>

                <div className="relative">
                  <Building className={iconClass} />

                  <input
                    type="text"
                    value={formData.law_firm}
                    onChange={(e) =>
                      setFormData({ ...formData, law_firm: e.target.value })
                    }
                    placeholder="Sharma & Partners"
                    className={inputClass}
                  />
                </div>
              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-bold text-[#34452F] bg-[#EAA34B] hover:bg-[#D18A32] shadow-md shadow-[#EAA34B]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Chamber...' : 'Create Legal Workspace'}

              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

          </form>

          {/* Sign In */}
          <div className="mt-6 pt-5 border-t border-[#E9DCC6] text-center text-xs text-[#7D806B]">
            Already have an active chamber?{' '}

            <Link
              to="/login"
              className="font-bold text-[#476B3F] hover:text-[#D18A32] transition-colors"
            >
              Sign in
            </Link>
          </div>

        </div>
      </div>

      <p className="mt-6 text-center text-[10px] text-[#E9DCC6]/70 z-10">
        SECURE LEGAL WORKSPACE • TRAIT ADVOCATE PRO AI
      </p>

    </div>
  );
};