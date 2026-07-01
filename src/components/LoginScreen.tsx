import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Key, Mail, CheckCircle, Flame } from 'lucide-react';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
}

export default function LoginScreen({ onLoginSuccess, users }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (val: string) => {
    if (!val) {
      return 'Email is required.';
    }
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!reg.test(val)) {
      return 'Enter a valid email address.';
    }
    return '';
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setEmailError('');
    setIsSubmitting(true);

    // Simulate small latency
    setTimeout(() => {
      // Find user matching email, or fallback to first user (Alex Rivera u1)
      const matchedUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || users[0];
      onLoginSuccess(matchedUser);
      setIsSubmitting(false);
    }, 600);
  };

  const handleContinueAsDemo = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess(users[0]); // Alex Rivera u1
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center p-4" id="login-screen-root">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-[#E2E8F0] dark:border-slate-700 p-8 space-y-6"
        id="login-card"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded bg-[#2563EB] flex items-center justify-center text-white">
              <Flame className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <h1 className="font-bold text-2xl tracking-tight text-[#0F172A] dark:text-white">
              Task<span className="text-[#2563EB]">Flow</span>
            </h1>
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
            Clean, collaborative team task-management.
          </p>
        </div>

        {/* Info panel */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-md p-3.5 text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Frontend Demo Sandbox</span>
          </div>
          <p className="leading-relaxed">
            Sign in with any email to proceed. Use <code className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded text-[10px]">alex@taskflow.app</code> to access default PM tasks, or click continue as demo user.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSignIn} className="space-y-4" id="form-login">
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                className={`w-full text-xs bg-[#F8FAFC] dark:bg-slate-900 border ${
                  emailError ? 'border-red-500' : 'border-[#E2E8F0] dark:border-slate-700'
                } rounded-md pl-9 pr-3 py-2.5 text-[#0F172A] dark:text-slate-100 focus:outline-none focus:ring-1 ${
                  emailError ? 'focus:ring-red-500' : 'focus:ring-[#283657]'
                } focus:bg-[#283657] focus:text-white dark:focus:bg-[#283657] dark:focus:text-white transition-colors`}
                placeholder="you@company.com"
                id="input-login-email"
                disabled={isSubmitting}
              />
            </div>
            {emailError && (
              <p className="text-red-500 text-xs font-medium flex items-center gap-1" id="login-email-error">
                <AlertCircle className="w-3.5 h-3.5" />
                {emailError}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-md pl-9 pr-3 py-2.5 text-[#0F172A] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#283657] focus:bg-[#283657] focus:text-white dark:focus:bg-[#283657] dark:focus:text-white transition-colors"
                placeholder="••••••••"
                id="input-login-password"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
            }`}
            id="btn-login-submit"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-x-0 border-t border-slate-100 dark:border-slate-700" />
          <span className="relative px-3 bg-white dark:bg-slate-800 text-slate-400 text-[10px] font-mono">OR</span>
        </div>

        {/* Secondary Demo access */}
        <div className="text-center">
          <button
            onClick={handleContinueAsDemo}
            disabled={isSubmitting}
            className="text-xs font-semibold text-[#2563EB] hover:text-blue-700 transition-colors underline cursor-pointer hover:no-underline"
            id="btn-login-demo-user"
          >
            Continue as demo user (Alex Rivera)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
