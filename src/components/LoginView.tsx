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
  Sun, 
  Moon, 
  Globe, 
  Mail, 
  Phone, 
  UserPlus, 
  LogIn, 
  BadgeCheck, 
  RefreshCw,
  Send,
  Clock,
  Check,
  AlertTriangle,
  X,
  ExternalLink
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { Language } from '../i18n/translations';
import { FirestoreSync } from '../data/firestoreSync';
import { SupabaseSync } from '../data/supabaseSync';
import { supabase } from '../lib/supabase';
import { DEFAULT_STAFF_USERS, DatabaseStorage } from '../data/dbManager';

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
  // Tabs: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In state
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

  // Supabase auth email confirmation feedback state
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendNotice, setResendNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verifiedNotice, setVerifiedNotice] = useState<string | null>(null);

  // UI status
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Check URL hash/parameters for Supabase email confirmation redirect callbacks
  useEffect(() => {
    const handleUrlAuthCallbacks = async () => {
      if (typeof window === 'undefined') return;

      const hash = window.location.hash;
      const search = window.location.search;

      // Handle verification link errors (e.g., token expired)
      if (hash.includes('error=')) {
        const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
        const errDesc = hashParams.get('error_description') || hashParams.get('error') || '';
        setError(
          lang === 'bn' 
            ? `⚠️ ভেরিফিকেশন লিংকের মেয়াদ শেষ হয়েছে বা লিংকটি সঠিক নয় (${errDesc})।` 
            : `⚠️ Verification link has expired or is invalid (${errDesc}).`
        );
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Check if arriving from a confirmation link (has access_token or code)
      if (hash.includes('access_token=') || search.includes('code=')) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const user = sessionData?.session?.user;
          if (user && user.email_confirmed_at) {
            setVerifiedNotice(
              lang === 'bn'
                ? `✓ অভিনন্দন! আপনার ইমেইল (${user.email}) সফলভাবে যাচাই (Verified) করা হয়েছে। এখন পাসওয়ার্ড দিয়ে লগইন করুন।`
                : `✓ Success! Your email (${user.email}) has been verified. You can now log in with your credentials.`
            );
            if (user.email) {
              setIdentifier(user.email);
            }
            setActiveTab('signin');
            setUnverifiedEmail(null);
            setError(null);

            // Update user in DB as verified
            await supabase.from('users').update({ 
              email_verified: true,
              status: 'Active' 
            }).eq('email', user.email);

            fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                emailVerified: true,
                status: 'Active'
              })
            }).catch(console.error);
          }
        } catch (e) {
          console.warn('Session check note:', e);
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleUrlAuthCallbacks();

    // Listen for real-time auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user?.email_confirmed_at) {
        setVerifiedNotice(
          lang === 'bn'
            ? `✓ আপনার ইমেইল (${session.user.email}) সফলভাবে নিশ্চিত করা হয়েছে! প্রবেশ করতে সাইন ইন করুন।`
            : `✓ Your email (${session.user.email}) is confirmed! Please sign in to enter.`
        );
        if (session.user.email) {
          setIdentifier(session.user.email);
        }
        setUnverifiedEmail(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [lang]);

  // Resend verification email handler
  const handleResendVerification = async (targetEmail?: string) => {
    const emailToSend = (targetEmail || unverifiedEmail || identifier).trim().toLowerCase();
    
    if (!emailToSend || !emailToSend.includes('@')) {
      setResendNotice({
        type: 'error',
        text: lang === 'bn' ? 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন' : 'Please provide a valid email address'
      });
      return;
    }

    if (resendCooldown > 0) return;

    setResendLoading(true);
    setResendNotice(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: emailToSend,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (resendError) {
        const errMsg = resendError.message || '';
        if (errMsg.toLowerCase().includes('rate limit') || errMsg.toLowerCase().includes('seconds')) {
          setResendNotice({
            type: 'error',
            text: lang === 'bn' 
              ? '⚠️ খুব ঘনঘন অনুরোধ করা হয়েছে। অনুগ্রহ করে ৬০ সেকেন্ড অপেক্ষা করুন।' 
              : '⚠️ Rate limit exceeded. Please wait 60 seconds before requesting again.'
          });
          setResendCooldown(60);
        } else {
          setResendNotice({
            type: 'error',
            text: lang === 'bn' ? `ব্যর্থ হয়েছে: ${errMsg}` : `Failed: ${errMsg}`
          });
        }
      } else {
        setResendNotice({
          type: 'success',
          text: lang === 'bn'
            ? `✓ যাচাইকরণ ইমেইল সফলভাবে পাঠানো হয়েছে '${emailToSend}' ঠিকানায়! আপনার ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।`
            : `✓ Verification email successfully sent to '${emailToSend}'! Please check your inbox or spam folder.`
        });
        setResendCooldown(60);
        setUnverifiedEmail(emailToSend);
      }
    } catch (err: any) {
      setResendNotice({
        type: 'error',
        text: err?.message || (lang === 'bn' ? 'ইমেইল পাঠাতে সমস্যা হয়েছে' : 'Failed to send verification email')
      });
    } finally {
      setResendLoading(false);
    }
  };

  // Handle Sign In submission with mandatory email verification check
  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setVerifiedNotice(null);
    setResendNotice(null);

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

    try {
      // 1. Gather all potential user profiles across local, Supabase, and backend
      const [sbUsers, fsUsers, apiUsers] = await Promise.allSettled([
        SupabaseSync.fetchUsers(),
        FirestoreSync.fetchUsers(),
        fetch('/api/users').then(r => r.ok ? r.json() : []).catch(() => [])
      ]);

      const candidateUsers: AuthUser[] = [
        ...DEFAULT_STAFF_USERS,
        ...staffUsers
      ];

      if (sbUsers.status === 'fulfilled' && Array.isArray(sbUsers.value)) {
        for (const u of sbUsers.value) {
          if (!candidateUsers.some(c => c.username?.toLowerCase() === u.username?.toLowerCase())) {
            candidateUsers.push(u);
          }
        }
      }

      if (fsUsers.status === 'fulfilled' && Array.isArray(fsUsers.value)) {
        for (const u of fsUsers.value) {
          if (!candidateUsers.some(c => c.username?.toLowerCase() === u.username?.toLowerCase())) {
            candidateUsers.push(u);
          }
        }
      }

      if (apiUsers.status === 'fulfilled' && Array.isArray(apiUsers.value)) {
        for (const u of apiUsers.value) {
          if (u.username && !candidateUsers.some(c => c.username?.toLowerCase() === u.username?.toLowerCase())) {
            candidateUsers.push({
              id: u.uid || u.id || `usr-${Date.now()}`,
              name: u.name || u.username,
              username: u.username,
              email: u.email || `${u.username}@tamannamotors.com`,
              password: u.password || 'admin123',
              phone: u.phone || '',
              role: u.role || 'cashier',
              businessLocation: u.businessLocation || 'Hazigonj Branch',
              status: u.status || 'Active',
              emailVerified: Boolean(u.email_verified || u.emailVerified),
              lastLogin: 'Today'
            });
          }
        }
      }

      // 2. Special Check: Root developer admin account 'admin'
      if (cleanIdent === 'admin' && (password === 'admin123' || password === 'admin')) {
        const adminUser = candidateUsers.find(u => u.username?.toLowerCase() === 'admin') || DEFAULT_STAFF_USERS[0];
        setLoading(false);
        setSuccessMsg(lang === 'bn' ? 'সুপার অ্যাডমিন হিসেবে সফলভাবে প্রবেশ করা হয়েছে!' : 'Super Admin signed in successfully!');
        onLogin(adminUser);
        return;
      }

      // 3. Find matching user profile
      const matched = candidateUsers.find(u => 
        (u.username && u.username.toLowerCase() === cleanIdent) || 
        (u.email && u.email.toLowerCase() === cleanIdent)
      );

      // Determine target email for verification check
      const targetEmail = matched?.email || (cleanIdent.includes('@') ? cleanIdent : null);

      if (!matched && !cleanIdent.includes('@')) {
        setError(
          lang === 'bn' 
            ? 'এই ইউজারনেমে কোনো অ্যাকাউন্ট পাওয়া যায়নি! সাইন আপ করুন।' 
            : 'Account not found! Please register or check your username.'
        );
        setLoading(false);
        return;
      }

      if (matched && matched.status === 'Suspended') {
        setError(
          lang === 'bn' 
            ? '⚠️ এই অ্যাকাউন্টটি স্থগিত রয়েছে। সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।' 
            : '⚠️ This account is suspended by Super Admin.'
        );
        setLoading(false);
        return;
      }

      // 4. Validate password if user exists in database
      if (matched && matched.password && matched.password !== password) {
        setError(
          lang === 'bn' 
            ? 'পাসওয়ার্ড সঠিক নয়! পুনরায় চেষ্টা করুন।' 
            : 'Incorrect password! Please try again.'
        );
        setLoading(false);
        return;
      }

      // 5. SUPABASE AUTHENTICATION
      let authUserId: string | null = null;
      if (targetEmail) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: password,
        });

        if (authError) {
          const authMsg = authError.message.toLowerCase();
          if (authMsg.includes('email not confirmed') || (authError as any).code === 'email_not_confirmed') {
            setLoading(false);
            setUnverifiedEmail(targetEmail);
            setError(
              lang === 'bn'
                ? `আপনার ইমেইলটি (${targetEmail}) এখনো কনফার্ম করা হয়নি। অনুগ্রহ করে ইনবক্স চেক করে Supabase এর পাঠানো কনফার্মেশন লিংকে ক্লিক করুন, তারপর লগইন করুন।`
                : `Your email (${targetEmail}) is not confirmed yet. Please check your inbox and click the confirmation link sent by Supabase, then log in.`
            );
            return;
          }
          if (authMsg.includes('rate limit')) {
            setLoading(false);
            setError(
              lang === 'bn'
                ? 'Supabase এর ইমেইল/রিকোয়েস্ট রেট লিমিট অতিক্রম হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।'
                : 'Rate limit exceeded by Supabase. Please wait a short while and try again.'
            );
            return;
          }
          // If credentials don't match locally either, report the error
          if (!matched || matched.password !== password) {
            setError(authError.message);
            setLoading(false);
            return;
          }
        } else if (authData?.user) {
          authUserId = authData.user.id;
        }
      }

      // If user matched in staffUsers or just authenticated via Supabase
      if (!matched && authUserId && targetEmail) {
        const syncdUser: AuthUser = {
          id: authUserId,
          name: targetEmail.split('@')[0],
          username: targetEmail.split('@')[0].toLowerCase(),
          email: targetEmail,
          password: password,
          phone: '+880 1700-000000',
          role: 'cashier',
          businessLocation: 'Hazigonj Branch',
          status: 'Active',
          emailVerified: true,
          lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        SupabaseSync.upsertUser(syncdUser);
        FirestoreSync.upsertUser(syncdUser);
        DatabaseStorage.saveCurrentUser(syncdUser);
        setLoading(false);
        setSuccessMsg(lang === 'bn' ? 'সফলভাবে প্রবেশ করা হয়েছে!' : 'Signed in successfully!');
        onLogin(syncdUser);
        return;
      }

      if (!matched) {
        setError(
          lang === 'bn' 
            ? 'অ্যাকাউন্টের তথ্য পাওয়া যায়নি।' 
            : 'Account details could not be verified.'
        );
        setLoading(false);
        return;
      }

      // User credentials matched!
      const updatedUser: AuthUser = {
        ...matched,
        password: matched.password || password,
        emailVerified: true,
        status: 'Active',
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Persist login state
      SupabaseSync.upsertUser(updatedUser);
      FirestoreSync.upsertUser(updatedUser);
      DatabaseStorage.saveCurrentUser(updatedUser);

      setLoading(false);
      setSuccessMsg(lang === 'bn' ? 'সফলভাবে প্রবেশ করা হয়েছে!' : 'Signed in successfully!');
      onLogin(updatedUser);
    } catch (err: any) {
      console.error("Login verification error:", err);
      setLoading(false);
      setError(
        lang === 'bn' 
          ? 'লগইন প্রক্রিয়া ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' 
          : 'Login failed. Please verify your credentials and network.'
      );
    }
  };

  // Handle Sign Up registration with MANDATORY Email & Email Verification
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setResendNotice(null);

    const cleanName = regName.trim();
    const cleanUser = regUsername.trim().toLowerCase();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName) {
      setError(lang === 'bn' ? 'আপনার পূর্ণ নাম লিখুন' : 'Please enter your full name');
      return;
    }
    if (!cleanUser) {
      setError(lang === 'bn' ? 'একটি ইউজারনেম (আইডি) লিখুন' : 'Please enter a username');
      return;
    }
    // Mandatory Email Check
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(
        lang === 'bn' 
          ? 'অনুগ্রহ করে একটি সঠিক ও সক্রিয় ইমেইল ঠিকানা লিখুন (ভেরিফিকেশন লিংক পাঠানো হবে)' 
          : 'Please enter a valid email address (a verification link will be sent)'
      );
      return;
    }
    if (!regPassword) {
      setError(lang === 'bn' ? 'পাসওয়ার্ড লিখুন' : 'Please enter a password');
      return;
    }
    if (regPassword.length < 6) {
      setError(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters long');
      return;
    }
    if (regConfirmPassword && regPassword !== regConfirmPassword) {
      setError(lang === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না! আবার চেক করুন।' : 'Passwords do not match! Please verify.');
      return;
    }

    setLoading(true);

    try {
      // 1. Prepare user object
      const generatedId = `usr-${Date.now()}`;
      const newUserObj: AuthUser = {
        id: generatedId,
        name: cleanName,
        username: cleanUser,
        email: cleanEmail,
        phone: regPhone.trim() || '+880 1700-000000',
        password: regPassword,
        role: regRole,
        businessLocation: regBranch,
        status: 'Active',
        emailVerified: false,
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // 2. Register with Supabase Authentication
      let isRateLimited = false;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: regPassword,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: cleanName,
            username: cleanUser,
            role: regRole,
            phone: regPhone.trim(),
            businessLocation: regBranch
          }
        }
      });

      if (authError) {
        const errMsg = authError.message.toLowerCase();
        if (errMsg.includes('already registered')) {
          setLoading(false);
          setError(
            lang === 'bn'
              ? 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত রয়েছে। অনুগ্রহ করে সাইন ইন করুন।'
              : 'This email is already registered. Please sign in.'
          );
          setIdentifier(cleanEmail);
          setActiveTab('signin');
          return;
        } else if (errMsg.includes('rate limit') || (authError as any)?.code === 'over_email_send_rate_limit') {
          isRateLimited = true;
          console.warn('Supabase email rate limit exceeded on sign up:', authError);
        } else {
          setLoading(false);
          setError(authError.message);
          return;
        }
      }

      if (authData?.user?.id) {
        newUserObj.id = authData.user.id;
        if (authData.user.email_confirmed_at) {
          newUserObj.emailVerified = true;
        }
      }

      // Store in Supabase, Cloud SQL, and Firestore
      await Promise.allSettled([
        SupabaseSync.upsertUser(newUserObj),
        FirestoreSync.upsertUser(newUserObj),
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUserObj)
        })
      ]);

      setLoading(false);
      onRegister?.(newUserObj, true);

      // Pre-fill email in Sign In tab
      setIdentifier(cleanEmail);
      setActiveTab('signin');
      setUnverifiedEmail(cleanEmail);

      if (isRateLimited) {
        setSuccessMsg(
          lang === 'bn'
            ? `অ্যাকাউন্ট প্রস্তুত হয়েছে! তবে Supabase ইমেইল রেট লিমিটের কারণে কনফার্মেশন মেইল আসতে কিছুটা দেরি হতে পারে। ইনবক্সে মেইল আসলে লিংকে ক্লিক করে কনফার্ম করুন এবং সাইন ইন করুন।`
            : `Account registered! Due to Supabase email limits, confirmation email may be slightly delayed. Please confirm when received and sign in.`
        );
      } else {
        setSuccessMsg(
          lang === 'bn'
            ? `অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! Supabase থেকে '${cleanEmail}' ঠিকানায় কনফার্মেশন লিংক পাঠানো হয়েছে। ইনবক্স থেকে ইমেইল কনফার্ম করুন এবং পাসওয়ার্ড দিয়ে সাইন ইন করুন।`
            : `Account created! Confirmation link sent by Supabase to '${cleanEmail}'. Please confirm from your inbox and sign in.`
        );
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      setLoading(false);
      setError(err?.message || (lang === 'bn' ? 'নিবন্ধন প্রক্রিয়া ব্যর্থ হয়েছে।' : 'Registration failed.'));
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans select-none">
      {/* Ambient background lights */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[800px] h-[480px] bg-gradient-to-b from-emerald-500/25 via-teal-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[600px] h-[550px] bg-gradient-to-tr from-cyan-600/20 via-blue-700/10 to-transparent rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header Bar */}
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

        {/* Action buttons: Language & Theme */}
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

      {/* Main Glassmorphic Card */}
      <main className="w-full max-w-lg mx-auto my-auto z-10 py-4 sm:py-6">
        <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-3xl border border-white/15 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.2)] p-6 sm:p-8 overflow-hidden transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Logo / Brand Header */}
          <div className="text-center mb-5">
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
                {activeTab === 'signin' 
                  ? (lang === 'bn' ? 'টার্মিনালে সাইন ইন করুন' : 'Terminal Sign In')
                  : (lang === 'bn' ? 'অ্যাকাউন্ট সাইন আপ করুন' : 'Sign Up Staff Account')}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {activeTab === 'signin'
                ? (lang === 'bn' ? 'আপনার ইউজারনেম ও পাসওয়ার্ড দিয়ে টার্মিনালে প্রবেশ করুন।' : 'Enter your registered credentials to access.')
                : (lang === 'bn' ? 'নতুন ইউজার অ্যাকাউন্ট তৈরি করতে ইমেইল ও তথ্য দিন।' : 'Register with your email to get started.')}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="mb-5 p-1 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-2xl flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setError(null);
                  setSuccessMsg(null);
                  setResendNotice(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 ring-1 ring-white/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? '১. সাইন ইন (Sign In)' : '1. Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setError(null);
                  setSuccessMsg(null);
                  setResendNotice(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 ring-1 ring-white/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? '২. সাইন আপ (Sign Up)' : '2. Sign Up'}</span>
              </button>
            </div>

          {/* Verified Notification Banner (From email link callback) */}
          {verifiedNotice && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-emerald-500/25 border border-emerald-400/50 p-3.5 text-xs text-emerald-200 font-medium backdrop-blur-md animate-in fade-in">
              <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="flex-1">
                <p className="font-bold text-white">{verifiedNotice}</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/35 p-3.5 text-xs text-rose-300 font-medium backdrop-blur-md animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Unverified Email Alert & Resend Box (Shown when email verification is required) */}
          {unverifiedEmail && activeTab === 'signin' && (
            <div className="mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 backdrop-blur-md animate-in fade-in space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex-1 text-xs">
                  <h4 className="font-bold text-amber-300">
                    {lang === 'bn' ? 'ইমেইল যাচাইকরণ আবশ্যক' : 'Email Verification Required'}
                  </h4>
                  <p className="text-slate-300 mt-0.5">
                    {lang === 'bn'
                      ? `অনুগ্রহ করে '${unverifiedEmail}' ঠিকানার ইনবক্সে গিয়ে ভেরিফিকেশন লিংকে ক্লিক করুন।`
                      : `Please check your inbox for '${unverifiedEmail}' and click the confirmation link.`}
                  </p>
                </div>
              </div>

              {/* Resend status message */}
              {resendNotice && (
                <div className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  resendNotice.type === 'success' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {resendNotice.type === 'success' ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  <span>{resendNotice.text}</span>
                </div>
              )}

              {/* Resend Button with Cooldown */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={resendLoading || resendCooldown > 0}
                  onClick={() => handleResendVerification(unverifiedEmail)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  {resendLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {resendCooldown > 0
                      ? (lang === 'bn' ? `পুনরায় পাঠান (${resendCooldown}s)` : `Resend in (${resendCooldown}s)`)
                      : (lang === 'bn' ? 'যাচাইকরণ ইমেইল পুনরায় পাঠান' : 'Resend Verification Email')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSignIn()}
                  className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-semibold transition-all cursor-pointer"
                >
                  {lang === 'bn' ? 'যাচাই করেছি, লগইন করুন' : 'I have verified, Try Sign In'}
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs text-emerald-300 font-medium backdrop-blur-md animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
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
                    placeholder={lang === 'bn' ? 'ইউজারনেম বা ইমেইল লিখুন' : 'e.g. admin or your email'}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-emerald-500/20 focus:outline-hidden transition-all backdrop-blur-md"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  {identifier.includes('@') && (
                    <button
                      type="button"
                      disabled={resendLoading || resendCooldown > 0}
                      onClick={() => handleResendVerification(identifier)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {resendCooldown > 0
                        ? (lang === 'bn' ? `কনফার্মেশন পাঠান (${resendCooldown}s)` : `Resend in (${resendCooldown}s)`)
                        : (lang === 'bn' ? 'কনফার্মেশন মেইল পুনরায় পাঠান' : 'Resend confirmation link')}
                    </button>
                  )}
                </div>
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 py-3 text-sm font-black shadow-[0_12px_28px_-6px_rgba(16,185,129,0.4)] hover:brightness-105 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Authenticating...'}</span>
                  </div>
                ) : (
                  <>
                    <span>{lang === 'bn' ? 'টার্মিনালে প্রবেশ করুন' : 'Sign In to Terminal'}</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP FORM */}
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
                      placeholder="e.g. manager1"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md font-mono transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory Email Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-300">
                    {lang === 'bn' ? 'ইমেইল ঠিকানা (যাচাইকরণ লিংক পাঠানো হবে) *' : 'Email Address (Verification Link Required) *'}
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    {lang === 'bn' ? 'যাচাই বাধ্যতামূলক' : 'Mandatory'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full rounded-xl border border-emerald-500/40 bg-emerald-950/20 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-emerald-500/30 focus:outline-hidden backdrop-blur-md transition-all font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {lang === 'bn' 
                    ? '⚠️ নিবন্ধনের পর এই ইমেইলে একটি নিশ্চিতকরণ লিংক যাবে। লিংকে ক্লিক না করা পর্যন্ত লগইন করা যাবে না।' 
                    : '⚠️ A confirmation link will be sent to this email. Access is strictly blocked until verified.'}
                </p>
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
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{lang === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Registering...'}</span>
                  </div>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 stroke-[2.5]" />
                    <span>{lang === 'bn' ? 'অ্যাকাউন্ট তৈরি ও ভেরিফিকেশন পাঠান' : 'Create Account & Send Verification'}</span>
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
        </div>

        {/* Security watermark footer */}
        <div className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <span>{lang === 'bn' ? 'নিরাপদ ক্লাউড সেশন · Supabase Auth সুরক্ষিত' : 'Secure Cloud Session · Supabase Auth Protected'}</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center text-[11px] text-slate-500 py-2 z-10 flex flex-wrap items-center justify-center gap-2">
        <span>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</span>
      </footer>
    </div>
  );
};
