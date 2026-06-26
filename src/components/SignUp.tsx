import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, UserPlus, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGES } from '../localization';

interface SignUpProps {
  onSignUpSuccess: (user: { email: string; password: string; country: string; fullName: string }) => void;
  onSwitchToLogin: () => void;
  lang: Language;
}

export default function SignUp({ onSignUpSuccess, onSwitchToLogin, lang }: SignUpProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState(lang.code);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) return setError('Full name is required.');
    if (!email.trim()) return setError('Email address is required.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    // Check if account already exists
    const existing = localStorage.getItem(`fifa_account_${email.toLowerCase()}`);
    if (existing) return setError('An account with this email already exists. Please log in.');

    setLoading(true);

    // Save account to localStorage
    const account = { email: email.toLowerCase(), password, fullName, country, createdAt: new Date().toISOString() };
    localStorage.setItem(`fifa_account_${email.toLowerCase()}`, JSON.stringify(account));

    setTimeout(() => {
      setLoading(false);
      const countryObj = LANGUAGES.find(l => l.code === country);
      onSignUpSuccess({ email: email.toLowerCase(), password, country: countryObj?.name || country, fullName });
    }, 1000);
  };

  return (
    <div className="max-w-md w-full mx-auto relative z-10">
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-sans mb-1">
            Create Your Account
          </h2>
          <p className="text-xs font-mono text-[#5B5F78] uppercase tracking-widest">
            Register to begin your accreditation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-mono rounded-xl">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-sans font-bold uppercase text-[#8B8FA8] tracking-widest">
              Full Legal Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="As it appears on your passport"
              className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-sans font-bold uppercase text-[#8B8FA8] tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
            />
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-sans font-bold uppercase text-[#8B8FA8] tracking-widest">
              Country of Departure
            </label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-sans appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='white' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M19 9l-7 7-7-7'></path></svg>")`, backgroundPosition: 'right 16px center', backgroundSize: '14px', backgroundRepeat: 'no-repeat' }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-[#13131A] text-white text-xs">
                  {l.flag} {l.name} ({l.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-sans font-bold uppercase text-[#8B8FA8] tracking-widest">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 pr-10 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B5F78] hover:text-white transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-sans font-bold uppercase text-[#8B8FA8] tracking-widest">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-zinc-100 text-[#13131A] font-sans font-bold text-xs uppercase rounded-full duration-200 tracking-wider shadow-lg cursor-pointer mt-2 active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <span className="animate-pulse">Creating account...</span>
            ) : (
              <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          {/* Switch to login */}
          <div className="pt-4 border-t border-white/[0.06] text-center">
            <span className="text-[11px] font-sans text-[#5B5F78]">Already have an account? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[11px] font-sans text-[#796BFF] hover:text-[#B6B3FF] font-semibold underline cursor-pointer transition"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-[9px] font-mono text-[#5B5F78] uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3" />
          End-to-end encrypted · Data secured
        </div>
      </div>
    </div>
  );
}
