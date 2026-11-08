import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('advocate.sharma@traitlaw.in');
    setPassword('Advocate@2026');
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#FFF8EC] px-4 py-5 text-[#263522] sm:px-6">

      <div className="w-full max-w-md">

        {/* BRAND HEADER */}
        <header className="mb-6 flex items-center justify-center border-b border-[#E9DCC6] pb-5 sm:mb-8 sm:pb-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#476B3F] shadow-md sm:h-12 sm:w-12">
              <Scale className="h-6 w-6 text-[#FFF8EC]" />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-wide text-[#34452F] sm:text-xl">
                TRAIT ADVOCATE{' '}
                <span className="text-[#D94F1E]">PRO AI</span>
              </h1>

              <p className="text-[8px] tracking-[2px] text-[#7D806B] sm:text-[9px] sm:tracking-[3px]">
                INTELLIGENT LEGAL PRACTICE PLATFORM
              </p>
            </div>

          </div>

        </header>

        {/* LOGIN CARD */}
        <section className="relative overflow-hidden rounded-3xl border border-[#E9DCC6] bg-[#FFFCF5] p-5 shadow-[0_20px_70px_rgba(52,69,47,0.12)] sm:p-8">

          {/* Decorative Background */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#EAA34B]/10 blur-[90px]" />

          <div className="relative">

            {/* EMBLEM */}
            <div className="mb-4 flex justify-center sm:mb-5">

              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#EAA34B]/50 bg-[#F8EFDF] shadow-lg shadow-[#EAA34B]/10 sm:h-16 sm:w-16">
                <ShieldCheck className="h-8 w-8 text-[#476B3F] sm:h-9 sm:w-9" />
              </div>

            </div>

            {/* HEADING */}
            <div className="mb-6 text-center sm:mb-7">

              <p className="mb-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-[#D18A32]">
                <Sparkles className="h-3.5 w-3.5" />
                ADVOCATE SECURE ACCESS
              </p>

              <h2 className="font-serif text-2xl font-bold text-[#34452F] sm:text-3xl">
                Welcome Back
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-[#7D806B] sm:text-sm">
                Sign in to access your professional legal workspace.
              </p>

            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#D94F1E]/20 bg-[#FCEAE3] p-3.5 text-xs text-[#BD4118]">

                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <span className="break-words">
                  {error}
                </span>

              </div>
            )}

            {/* LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

              {/* EMAIL */}
              <div>

                <label
                  htmlFor="login-email"
                  className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#34452F] sm:text-sm"
                >
                  <Mail className="h-4 w-4 text-[#53602F]" />
                  Official Email
                </label>

                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advocate@firm.in"
                  autoComplete="username"
                  className="min-h-12 w-full rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-4 py-3 text-base text-[#263522] outline-none transition placeholder:text-sm placeholder:text-[#9B9B83] focus:border-[#53602F] focus:ring-2 focus:ring-[#EAA34B]/20 sm:text-sm"
                />

              </div>

              {/* PASSWORD */}
              <div>

                <label
                  htmlFor="login-password"
                  className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#34452F] sm:text-sm"
                >
                  <Lock className="h-4 w-4 text-[#53602F]" />
                  Password
                </label>

                <div className="relative">

                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="min-h-12 w-full rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-4 py-3 pr-12 text-base text-[#263522] outline-none transition placeholder:text-sm placeholder:text-[#9B9B83] focus:border-[#53602F] focus:ring-2 focus:ring-[#EAA34B]/20 sm:text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#7D806B] transition hover:bg-[#F8EFDF] hover:text-[#D94F1E]"
                  >
                    {showPassword
                      ? <EyeOff className="h-5 w-5" />
                      : <Eye className="h-5 w-5" />}
                  </button>

                </div>

              </div>

              {/* SIGN IN */}
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#476B3F] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#476B3F]/20 transition-all hover:bg-[#34452F] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}

                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>

            </form>

            {/* DIVIDER */}
            <div className="my-5 flex items-center gap-4 sm:my-6">

              <div className="h-px flex-1 bg-[#E9DCC6]" />

              <span className="text-xs text-[#9B9B83]">
                OR
              </span>

              <div className="h-px flex-1 bg-[#E9DCC6]" />

            </div>

            {/* DEMO LOGIN */}
            <button
              type="button"
              onClick={handleDemoFill}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#EAA34B]/50 bg-[#F8EFDF] px-5 py-3.5 text-sm font-semibold text-[#53602F] transition hover:border-[#D18A32] hover:bg-[#F4E6CC] active:scale-[0.98]"
            >
              <ShieldCheck className="h-5 w-5 text-[#D18A32]" />
              Fill Demo Login
            </button>

            {/* REGISTRATION */}
            <div className="mt-6 text-center text-xs leading-6 text-[#7D806B] sm:mt-7 sm:text-sm">

              Need a new advocate workspace?

              <Link
                to="/register"
                className="ml-1 inline-block font-bold text-[#D94F1E] transition hover:text-[#BD4118] hover:underline"
              >
                Register now
              </Link>

            </div>

          </div>

        </section>

        {/* SECURITY FOOTER */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-[#7D806B] sm:text-xs">

          <Lock className="h-3.5 w-3.5 text-[#53602F]" />

          Secure Advocate Workspace

        </div>

        {/* BRAND FOOTER */}
        <footer className="mt-5 border-t border-[#E9DCC6] pt-4 text-center text-[10px] leading-relaxed text-[#7D806B] sm:mt-7 sm:text-xs">

          <p className="font-semibold text-[#53602F]">
            TRAIT Innovation
          </p>

          <p className="mt-1">
            Enterprise Legal AI Platform
          </p>

          <p className="mt-1">
            Built for Advocates. Powered by AI.
          </p>

        </footer>

      </div>

    </main>
  );
};

export default Login;