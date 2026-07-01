import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, User as UserIcon, Palette, Sliders, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { User, AppSettings } from '../types';

interface SettingsScreenProps {
  currentUser: User;
  onUpdateProfile: (updatedProfile: Partial<User>) => void;
  onTriggerToast: (msg: string, type: 'success' | 'error') => void;
}

export default function SettingsScreen({
  currentUser,
  onUpdateProfile,
  onTriggerToast,
}: SettingsScreenProps) {
  // Profile form state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState(currentUser.role);
  const [avatarColor, setAvatarColor] = useState(currentUser.avatarColor);

  // Preference state (Client-side toggling)
  const [defaultView, setDefaultView] = useState<'board' | 'list'>('board');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [defaultSort, setDefaultSort] = useState<'deadline' | 'priority' | 'createdAt'>('deadline');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Toggle Theme mode function
  const handleThemeChange = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    const htmlEl = document.documentElement;
    if (mode === 'dark') {
      htmlEl.classList.add('dark-theme');
    } else {
      htmlEl.classList.remove('dark-theme');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!name.trim()) {
      setNameError('Name is required.');
      return;
    }
    setNameError('');

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailReg.test(email)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError('');

    setIsSaving(true);

    setTimeout(() => {
      // Derive initials from name
      const names = name.trim().split(' ');
      const initials = names.map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

      // Save Profile Callback
      onUpdateProfile({
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        avatarColor,
        initials,
      });

      onTriggerToast('Profile preferences updated successfully.', 'success');
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="space-y-6" id="settings-screen-root">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
          Account Settings
        </h1>
        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
          Update your profile details and customize workspace preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="form-settings">
        {/* Left column: Profile card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-[#E2E8F0] dark:border-slate-700 p-6 shadow-sm space-y-6">
            <h2 className="font-semibold text-base text-[#0F172A] dark:text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#2563EB]" />
              My Profile Info
            </h2>

            {/* Profile Avatar Editor row */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#F8FAFC] dark:bg-slate-900/40 rounded-md">
              <div 
                className="w-16 h-16 rounded flex items-center justify-center text-2xl font-bold text-white shadow-sm shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                {name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
              </div>

              <div className="text-center sm:text-left space-y-2">
                <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                  Customize Avatar Accent
                </span>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start" id="avatar-color-picker">
                  {['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#7C3AED', '#06B6D4', '#EC4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className={`w-6.5 h-6.5 rounded-full border transition-all cursor-pointer ${
                        avatarColor === c ? 'scale-110 border-slate-400 dark:border-white ring-2 ring-[#2563EB]' : 'hover:scale-105 border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                      id={`btn-avatar-color-${c.replace('#', '')}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  className={`w-full text-xs bg-[#F8FAFC] dark:bg-slate-900 border ${
                    nameError ? 'border-red-500' : 'border-[#E2E8F0] dark:border-slate-750'
                  } rounded-md p-2.5 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 ${
                    nameError ? 'focus:ring-red-500' : 'focus:ring-[#283657]'
                  } focus:bg-[#283657] focus:text-white`}
                  id="input-settings-name"
                  required
                />
                {nameError && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {nameError}
                  </p>
                )}
              </div>

              {/* Email address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={`w-full text-xs bg-[#F8FAFC] dark:bg-slate-900 border ${
                    emailError ? 'border-red-500' : 'border-[#E2E8F0] dark:border-slate-750'
                  } rounded-md p-2.5 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 ${
                    emailError ? 'focus:ring-red-500' : 'focus:ring-[#283657]'
                  } focus:bg-[#283657] focus:text-white`}
                  id="input-settings-email"
                  required
                />
                {emailError && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Position / Role */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                  Workspace Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-750 rounded-md p-2.5 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#283657] focus:bg-[#283657] focus:text-white"
                  placeholder="e.g. Lead Designer"
                  id="input-settings-role"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Preferences sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-[#E2E8F0] dark:border-slate-700 p-6 shadow-sm space-y-6">
            <h2 className="font-semibold text-base text-[#0F172A] dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#2563EB]" />
              Preferences
            </h2>

            {/* App Theme selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                Visual Theme
              </label>
              <div className="grid grid-cols-2 gap-2" id="theme-selector-group">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`px-3 py-2 text-xs font-semibold rounded border transition-all cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-blue-50/50 border-blue-200 text-[#2563EB] ring-1 ring-[#2563EB]'
                      : 'border-slate-150 dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                  id="btn-theme-light"
                >
                  Light Theme
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`px-3 py-2 text-xs font-semibold rounded border transition-all cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-blue-50/50 border-blue-200 text-[#2563EB] ring-1 ring-[#2563EB]'
                      : 'border-slate-150 dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                  id="btn-theme-dark"
                >
                  Dark Theme (Beta)
                </button>
              </div>
            </div>

            {/* Default Layout View selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                Default Layout View
              </label>
              <div className="grid grid-cols-2 gap-2" id="view-selector-group">
                <button
                  type="button"
                  onClick={() => setDefaultView('board')}
                  className={`px-3 py-2 text-xs font-semibold rounded border transition-all cursor-pointer ${
                    defaultView === 'board'
                      ? 'bg-blue-50/50 border-blue-200 text-[#2563EB] ring-1 ring-[#2563EB]'
                      : 'border-slate-150 dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                  id="btn-pref-board"
                >
                  Kanban Board
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultView('list')}
                  className={`px-3 py-2 text-xs font-semibold rounded border transition-all cursor-pointer ${
                    defaultView === 'list'
                      ? 'bg-blue-50/50 border-blue-200 text-[#2563EB] ring-1 ring-[#2563EB]'
                      : 'border-slate-150 dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                  id="btn-pref-list"
                >
                  Registry List
                </button>
              </div>
            </div>

            {/* Default Tasks Sort selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                Default Tasks Sort
              </label>
              <select
                value={defaultSort}
                onChange={(e) => setDefaultSort(e.target.value as any)}
                className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-750 text-xs rounded p-2.5 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#283657] cursor-pointer"
                id="select-pref-sort"
              >
                <option value="deadline">Due Deadline</option>
                <option value="priority">Priority weight</option>
                <option value="createdAt">Creation timestamp</option>
              </select>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                id="btn-settings-save"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Configuration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
