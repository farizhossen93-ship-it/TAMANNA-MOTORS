import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Sun,
  Moon,
  Globe,
  Mail,
  Phone,
  UserPlus,
  LogIn,
  Store,
  Check,
  BadgeCheck,
  KeyRound,
  Copy,
  RotateCcw,
  Inbox,
  X
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface LoginViewProps {
  staffUsers: AuthUser[];
  onLogin: (user: AuthUser) => void;
  onRegister?: (user: AuthUser, autoLogin?: boolean) => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  logoUrl?: string;
  businessName?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  staffUsers,
  onLogin,
  onRegister,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  logoUrl,
  businessName = "TAMANNA MOTORS"
}) => {
  // User explicitly requested: "age sign up then sign in" (first sign up, then sign in)
  // If there are no users, default directly to 'signup'. If users exist, default to 'signin' or 'signup'.
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>(() => 
    staffUsers.length === 0 ? 'signup' : 'signin'
  );

  // Sign In state (clean, no demo data)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('super_admin');
  const [regBranch, setRegBranch] = useState('Hazigonj Branch');

  // UI status
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Super Admin Email OTP State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [pendingSuperAdminUser, setPendingSuperAdminUser] = useState<AuthUser | null>(null);
  const [simulatedEmailToast, setSimulatedEmailToast] = useState<{
    email: string;
    code: string;
  } | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isOtpModalOpen && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpModalOpen, otpCountdown]);

  const handleResendOtp = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setEnteredOtp('');
    setOtpCountdown(60);
    setOtpError(null);
    if (pendingSuperAdminUser) {
      setSimulatedEmailToast({
        email: pendingSuperAdminUser.email,
        code: newCode
      });
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError(lang === 'bn' ? 'ভুল ওটিপি কোড! অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Invalid OTP code! Please try again.');
      return;
    }
    if (pendingSuperAdminUser) {
      const verifiedUser: AuthUser = {
        ...pendingSuperAdminUser,
        status: 'Active'
      };
      setIsOtpModalOpen(false);
      setSimulatedEmailToast(null);
      setSuccessMsg(
        lang === 'bn' 
          ? 'সুপার অ্যাডমিন ওটিপি সফলভাবে যাচাই হয়েছে! টার্মিনালে প্রবেশ করা হচ্ছে...' 
          : 'Super Admin OTP verified successfully! Launching terminal...'
      );
      setTimeout(() => {
        if (onRegister) {
          onRegister(verifiedUser, true);
        } else {
          onLogin(verifiedUser);
        }
      }, 350);
    }
  };

  // Handle Sign In submission
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanIdent = identifier.trim().toLowerCase();
    if (!cleanIdent) {
      setError(lang === 'bn' ? 'ইউজারনেম বা ইমেইল ঠিকানা লিখুন' : 'Please enter your username or email');
      return;
    }
    if (!password) {
      setError(lang === 'bn' ? 'পাসওয়ার্ড লিখুন' : 'Please enter your password');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Find matching user from database
      const matched = staffUsers.find(u => 
        (u.email.toLowerCase() === cleanIdent || u.username.toLowerCase() === cleanIdent)
      );

      if (!matched) {
        setError(
          lang === 'bn' 
            ? 'এই ইউজারনেম বা ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি! অনুগ্রহ করে প্রথমে "সাইন আপ" ট্যাবে অ্যাকাউন্ট তৈরি করুন।' 
            : 'Account not found! Please register a new account under the "Sign Up" tab first.'
        );
        setLoading(false);
        return;
      }

      if (matched.status === 'Pending Approval') {
        setError(
          lang === 'bn' 
            ? '⚠️ আপনার অ্যাকাউন্টটি এখনও সুপার অ্যাডমিন কর্তৃক অনুমোদিত হয়নি! অনুগ্রহ করে প্রধান সুপার অ্যাডমিন বা ম্যানেজমেন্টের সাথে যোগাযোগ করুন। (Status: Pending Super Admin Authorization)' 
            : '⚠️ This account is pending Super Admin authorization! Please contact the Super Admin to authorize your access before logging in.'
        );
        setLoading(false);
        return;
      }

      if (matched.status === 'Suspended') {
        setError(lang === 'bn' ? 'এই অ্যাকাউন্টটি সাময়িকভাবে স্থগিত রয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।' : 'This account is suspended. Please contact the administrator.');
        setLoading(false);
        return;
      }

      // Validate password
      if (matched.password && matched.password !== password) {
        setError(lang === 'bn' ? 'পাসওয়ার্ড সঠিক নয়! পুনরায় চেষ্টা করুন।' : 'Incorrect password! Please try again.');
        setLoading(false);
        return;
      }

      const updatedUser: AuthUser = {
        ...matched,
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setLoading(false);
      onLogin(updatedUser);
    }, 280);
  };

  // Handle Sign Up registration
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanName = regName.trim();
    const cleanUser = regUsername.trim().toLowerCase();
    const cleanEmail = regEmail.trim();

    if (!cleanName) {
      setError(lang === 'bn' ? 'আপনার পূর্ণ নাম লিখুন' : 'Please enter your full name');
      return;
    }
    if (!cleanUser) {
      setError(lang === 'bn' ? 'একটি ইউজারনেম (আইডি) লিখুন' : 'Please enter a username');
      return;
    }
    if (!regPassword) {
      setError(lang === 'bn' ? 'পাসওয়ার্ড লিখুন' : 'Please enter a password');
      return;
    }
    if (regPassword.length < 4) {
      setError(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' : 'Password must be at least 4 characters long');
      return;
    }
    if (regConfirmPassword && regPassword !== regConfirmPassword) {
      setError(lang === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না! আবার চেক করুন।' : 'Passwords do not match! Please verify.');
      return;
    }

    // Check if username already exists in registered staff
    const existing = staffUsers.find(u => 
      u.username.toLowerCase() === cleanUser || 
      (cleanEmail && u.email.toLowerCase() === cleanEmail.toLowerCase())
    );

    if (existing) {
      setError(
        lang === 'bn' 
          ? `ইউজারনেম '${cleanUser}' ইতিমধ্যে নিবন্ধিত! অনুগ্রহ করে সাইন ইন করুন অথবা ভিন্ন ইউজারনেম দিন।` 
          : `Username '${cleanUser}' is already registered! Please sign in or choose another.`
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Super Admin: Send OTP to email and require verification
      if (regRole === 'super_admin') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const newSuperAdmin: AuthUser = {
          id: `usr-${Date.now()}`,
          name: cleanName,
          username: cleanUser,
          email: cleanEmail || `${cleanUser}@tamannamotors.com`,
          phone: regPhone.trim() || '+880 1700-000000',
          password: regPassword,
          role: regRole,
          businessLocation: regBranch,
          status: 'Active',
          lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setGeneratedOtp(code);
        setEnteredOtp('');
        setOtpCountdown(60);
        setOtpError(null);
        setPendingSuperAdminUser(newSuperAdmin);
        setIsOtpModalOpen(true);
        setSimulatedEmailToast({
          email: newSuperAdmin.email,
          code
        });
        setLoading(false);
        return;
      }

      // Non-super admin staff: Must be authorized by Super Admin!
      const newStaffUser: AuthUser = {
        id: `usr-${Date.now()}`,
        name: cleanName,
        username: cleanUser,
        email: cleanEmail || `${cleanUser}@tamannamotors.com`,
        phone: regPhone.trim() || '+880 1700-000000',
        password: regPassword,
        role: regRole,
        businessLocation: regBranch,
        status: 'Pending Approval',
        lastLogin: 'Never'
      };

      setLoading(false);
      if (onRegister) {
        onRegister(newStaffUser, false);
      }
      setSuccessMsg(
        lang === 'bn' 
          ? `নিবন্ধন সফল হয়েছে! আইডি: '${cleanUser}'। আপনার অ্যাকাউন্টটি সুপার অ্যাডমিনের অনুমোদনের অপেক্ষায় রয়েছে (Pending Super Admin Authorization)। অনুমোদন পাওয়ার পর সাইন ইন করতে পারবেন।` 
          : `Registration successful! ID: '${cleanUser}'. Your account is pending Super Admin authorization. You will be able to sign in once authorized.`
      );
      setActiveTab('signin');
      setIdentifier(cleanUser);
      setPassword('');
    }, 300);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans select-none">
      {/* Dynamic ambient glass mesh lights */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[800px] h-[480px] bg-gradient-to-b from-emerald-500/25 via-teal-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[600px] h-[550px] bg-gradient-to-tr from-cyan-600/20 via-blue-700/10 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-600/20 via-teal-800/10 to-transparent rounded-full blur-[150px] pointer-events-none" />

      {/* Glass Top Header Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.4)] ring-1 ring-white/30">
            <Wrench className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              {businessName}
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md backdrop-blur-md">
                POS · ERP
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {lang === 'bn' ? 'মোটর পার্টস ও বিক্রয় টার্মিনাল' : 'Enterprise Motorcycle Spares & Terminal'}
            </p>
          </div>
        </div>

        {/* Language & Theme Glass Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleLang(lang === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 text-xs font-bold text-slate-200 transition-all backdrop-blur-xl shadow-xs cursor-pointer active:scale-95"
            title="Toggle Language"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-400" />
            <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 transition-all backdrop-blur-xl shadow-xs cursor-pointer active:scale-95"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-400" />}
          </button>
        </div>
      </header>

      {/* Main Glassmorphic Terminal Card */}
      <main className="w-full max-w-lg mx-auto my-auto z-10 py-4 sm:py-6">
        <div className="relative rounded-3xl bg-slate-900/50 backdrop-blur-3xl border border-white/15 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.2)] p-6 sm:p-8 overflow-hidden transition-all duration-300">
          {/* Subtle top iridescent beam */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
          
          {/* Subtle inner corner glowing highlight */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Logo / Brand Header */}
          <div className="text-center mb-6">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-12 w-auto max-w-[140px] mx-auto object-contain mb-2.5 rounded-xl ring-1 ring-white/15 p-1 bg-white/[0.04] backdrop-blur-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>
                {activeTab === 'signup' 
                  ? (lang === 'bn' ? 'অ্যাকাউন্ট সাইন আপ করুন' : 'Sign Up Staff Account')
                  : (lang === 'bn' ? 'টার্মিনালে সাইন ইন করুন' : 'Terminal Sign In')}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {activeTab === 'signup'
                ? (lang === 'bn' ? 'প্রথমে অ্যাকাউন্ট তৈরি করুন, এরপর সরাসরি সাইন ইন করুন।' : 'Register your credentials first, then sign in directly.')
                : (lang === 'bn' ? 'আপনার ইউজারনেম ও পাসওয়ার্ড দিয়ে টার্মিনালে প্রবেশ করুন।' : 'Enter your registered username and password to proceed.')}
            </p>
          </div>

          {/* Polished Glass Tab Switcher: "age sign up then sign in" */}
          <div className="mb-6 p-1 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-2xl flex items-center gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 ring-1 ring-white/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? '১. সাইন আপ (Sign Up)' : '1. Sign Up'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 ring-1 ring-white/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? '২. সাইন ইন (Sign In)' : '2. Sign In'}</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/35 p-3 text-xs text-rose-300 font-medium backdrop-blur-md animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs text-emerald-300 font-medium backdrop-blur-md animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN UP FORM (Age Sign Up) */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ রহিম' : 'e.g. Md. Rahim Ali'}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'ইউজারনেম (আইডি) *' : 'Username *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs">
                      @
                    </div>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. admin101"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md font-mono transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+880 1711-000000"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md font-mono transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-8 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm Password *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <BadgeCheck className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'দায়িত্ব / পদবী *' : 'Role *'}
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-white focus:border-emerald-400 focus:outline-hidden backdrop-blur-md cursor-pointer"
                  >
                    <option value="super_admin">{lang === 'bn' ? 'সুপার অ্যাডমিন (মালিক)' : 'Super Admin (Owner)'}</option>
                    <option value="admin">{lang === 'bn' ? 'শাখা অ্যাডমিন' : 'Branch Admin'}</option>
                    <option value="manager">{lang === 'bn' ? 'শোরুম ম্যানেজার' : 'Showroom Manager'}</option>
                    <option value="cashier">{lang === 'bn' ? 'ক্যাশিয়ার / পিওএস অপারেটর' : 'Cashier / POS'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'শাখা / শোরুম *' : 'Branch Location *'}
                  </label>
                  <select
                    value={regBranch}
                    onChange={(e) => setRegBranch(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-white focus:border-emerald-400 focus:outline-hidden backdrop-blur-md cursor-pointer"
                  >
                    <option value="Hazigonj Branch">Hazigonj Branch (হাজীগঞ্জ শাখা, চাঁদপুর)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 py-3 text-sm font-black shadow-[0_12px_28px_-6px_rgba(16,185,129,0.4)] hover:brightness-105 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span>{lang === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...'}</span>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 stroke-[2.5]" />
                    <span>{lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করে সরাসরি সাইন ইন' : 'Create Account & Sign In'}</span>
                  </>
                )}
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? সাইন ইন করুন →' : 'Already have an account? Sign In →'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN IN FORM (Clean, No Demo Accounts) */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  {lang === 'bn' ? 'ইউজারনেম বা ইমেইল' : 'Username or Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={lang === 'bn' ? 'আপনার ইউজারনেম বা ইমেইল লিখুন' : 'Enter username or email'}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-emerald-500/20 focus:outline-hidden transition-all backdrop-blur-md"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-emerald-500/20 focus:outline-hidden transition-all backdrop-blur-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>{lang === 'bn' ? 'সেশন মনে রাখুন' : 'Remember Session'}</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create new account'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 py-3 text-sm font-black shadow-[0_12px_28px_-6px_rgba(16,185,129,0.4)] hover:brightness-105 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span>{lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Authenticating...'}</span>
                ) : (
                  <>
                    <span>{lang === 'bn' ? 'টার্মিনালে প্রবেশ করুন' : 'Sign In to Terminal'}</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    {lang === 'bn' ? 'প্রথমে এখানে সাইন আপ করুন' : 'Sign up first here'}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Security watermark footer */}
        <div className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <span>{lang === 'bn' ? 'নিরাপদ এনক্রিপ্টেড সেশন · তামান্না মোটরস' : '256-Bit Encrypted Secure Session · TAMANNA MOTORS'}</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center text-[11px] text-slate-500 py-2 z-10">
        &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
      </footer>
    </div>
  );
};
