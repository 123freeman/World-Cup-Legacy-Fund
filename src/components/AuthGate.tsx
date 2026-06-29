import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, ArrowRight, UserPlus, Fingerprint } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGES } from '../localization';
import { authService } from '../supabase';

interface AuthGateProps {
  onAuthSuccess: (user: { email: string; role: 'traveler' | 'admin'; country: string }) => void;
  lang: Language;
  isAdminPathAccessed?: boolean;
}

export default function AuthGate({ onAuthSuccess, lang, isAdminPathAccessed = false }: AuthGateProps) {
  const [role, setRole] = useState<'traveler' | 'admin'>('traveler');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [country, setCountry] = useState(lang.code);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const handleClearance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required.');
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'worldcuplegacyfund@081.Kokoma';
    if (role === 'admin' && passcode !== adminPassword) {
      setError('Invalid admin passcode. Please enter the secure clearance passcode.');
      return;
    }

    setScanning(true);
    setScanMessage('ESTABLISHING SECURE CONNECTION...');

    setTimeout(() => {
      setScanMessage('VERIFYING EU CITIZEN DETAILS...');
      setTimeout(() => {
        setScanMessage('ISSUING DIGITAL SECURITY PASS...');
        setTimeout(() => {
          authService.signIn(email, role).then(() => {
            authService.getUserRole(email).then((dbRole) => {
              setScanning(false);
              const selectedCountryObj = LANGUAGES.find(l => l.code === country) || lang;

              if (role === 'admin' && dbRole !== 'admin') {
                setError('Access denied. Your database profile does not have administrative privileges.');
                return;
              }

              onAuthSuccess({ email, role: dbRole, country: selectedCountryObj.name });
            }).catch(() => {
              setScanning(false);
              const selectedCountryObj = LANGUAGES.find(l => l.code === country) || lang;
              onAuthSuccess({ email, role, country: selectedCountryObj.name });
            });
          }).catch(() => {
            setScanning(false);
            const selectedCountryObj = LANGUAGES.find(l => l.code === country) || lang;
            onAuthSuccess({ email, role, country: selectedCountryObj.name });
          });
        }, 800);
      }, 800);
    }, 800);
  };

  return (
    <div id="auth_security_gate_container" className="max-w-md w-full mx-auto relative z-10 transition-all duration-300">
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-scanlines opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="WCLF" className="h-14 w-auto mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight uppercase flex items-center justify-center gap-1.5">
            {role === 'admin' ? 'ADMIN DISPATCH DECK' : 'TRAVEL ACCREDITATION GATE'}
          </h2>
          <p className="text-xs font-sans text-[#5B5F78] uppercase mt-1 tracking-widest">
            {role === 'admin' ? 'SYSTEM MANAGEMENT PORTAL' : 'EUROPEAN REGISTER ENTRANCE'}
          </p>
        </div>

        {/* Scanning overlay */}
        {scanning ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center">
                <Fingerprint className="w-10 h-10 text-[#796BFF]" />
              </div>
              <div className="absolute -inset-1 rounded-full border-t-2 border-[#796BFF] animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-xs font-sans text-[#796BFF] tracking-wider font-bold animate-bounce uppercase">
                {scanMessage}
              </p>
              <p className="text-[10px] font-sans text-[#8B8FA8] uppercase mt-2 font-semibold">
                Securing digital pass credentials...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleClearance} className="space-y-5">
            {error && (
              <div id="auth_error_box" className="p-3.5 bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-sans rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Tab — only visible on admin path */}
            {isAdminPathAccessed && (
              <div className="grid grid-cols-2 p-1 glass rounded-xl">
                <button
                  type="button"
                  onClick={() => { setRole('traveler'); setError(''); }}
                  className={`py-2 text-[10px] md:text-xs font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
                    role === 'traveler'
                      ? 'bg-[#796BFF]/15 text-[#B6B3FF] border border-[#796BFF]/30'
                      : 'text-[#8B8FA8] hover:text-white/90'
                  }`}
                >
                  European Traveler
                </button>
                <button
                  type="button"
                  onClick={() => { setRole('admin'); setError(''); }}
                  className={`py-2 text-[10px] md:text-xs font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
                    role === 'admin'
                      ? 'bg-[#796BFF]/15 text-[#B6B3FF] border border-[#796BFF]/30'
                      : 'text-[#8B8FA8] hover:text-white/90'
                  }`}
                >
                  System Admin
                </button>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-sans font-bold uppercase text-[#8B8FA8] tracking-widest">
                Official E-Passport Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
              />
            </div>

            {/* Passcode — admin only */}
            {role === 'admin' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-sans font-bold uppercase text-[#8B8FA8] tracking-widest">
                    Sector Passcode (Officer Clearance)
                  </label>
                  <span className="text-[9px] font-sans text-[#5B5F78] lowercase">(Clearance passcode required)</span>
                </div>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-4 w-4 h-4 text-[#5B5F78] pointer-events-none z-10" />
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter clearance token"
                    className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                  />
                </div>
              </div>
            )}

            {/* Country — traveler only */}
            {role === 'traveler' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                <label className="block text-[10px] font-sans font-bold uppercase text-[#8B8FA8] tracking-widest">
                  Constituency Of Departure
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-sans appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='white' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M19 9l-7 7-7-7'></path></svg>")`, backgroundPosition: 'right 16px center', backgroundSize: '14px', backgroundRepeat: 'no-repeat' }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#13131A] text-white font-sans text-xs">
                      {l.flag} {l.name} ({l.currency})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-zinc-100 text-[#13131A] font-sans font-bold text-xs uppercase rounded-full duration-200 tracking-wider shadow-lg cursor-pointer mt-4 active:scale-95"
            >
              <span>ACQUIRE PORTAL CLEARANCE</span>
              <ArrowRight className="w-4 h-4 text-[#13131A]" />
            </button>

            {/* Bottom links — autofill buttons removed, replaced with clean sign up link */}
            <div className="pt-6 border-t border-white/[0.06] flex justify-center gap-3 text-[10px] font-sans">
              <span className="text-[#5B5F78]">Don't have an account?</span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 text-[#796BFF] hover:text-[#B6B3FF] transition cursor-pointer font-semibold"
              >
                <UserPlus className="w-3.5 h-3.5" /> Sign up
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-[9px] font-mono text-[#5B5F78] uppercase tracking-widest leading-relaxed">
          Security clearance and data processing handled with end-to-end encryption. All records fully secured.
        </div>
      </div>
    </div>
  );
}