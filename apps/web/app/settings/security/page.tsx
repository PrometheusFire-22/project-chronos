'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@chronos/ui/components/button';
import { authClient } from '@/lib/auth-client';

export default function SecurityPage() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function validate(): string | null {
    if (!currentPassword) return 'Current password is required.';
    if (newPassword.length < 8) return 'New password must be at least 8 characters.';
    if (newPassword !== confirmPassword) return 'Passwords do not match.';
    return null;
  }

  async function handleChangePassword() {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      setState('error');
      return;
    }
    setState('saving');
    setErrorMsg('');
    try {
      await authClient.changePassword({ currentPassword, newPassword });
      setState('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setState('idle');
        setShowPasswordForm(false);
      }, 2000);
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Failed to change password.');
      setState('error');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Security Settings</h2>
        <p className="text-gray-400 mt-1">Manage your password and security preferences.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl divide-y divide-white/5">
        {/* Password Section */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Key className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Password</h3>
              <p className="text-sm text-gray-400 mt-1">
                Change your password or request a reset email.
              </p>
            </div>
            {!showPasswordForm && (
              <Button
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </Button>
            )}
          </div>

          <AnimatePresence>
            {showPasswordForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                        placeholder="Min 8 characters"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {state === 'error' && errorMsg && (
                    <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{errorMsg}</p>
                  )}
                  {state === 'success' && (
                    <p className="text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Password changed successfully!
                    </p>
                  )}

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setState('idle');
                        setErrorMsg('');
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-purple-600 hover:bg-purple-500 text-white"
                      onClick={handleChangePassword}
                      disabled={state === 'saving'}
                    >
                      {state === 'saving' ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2FA Section (Placeholder) */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-400 mt-1">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Button disabled className="bg-white/10 text-gray-500 cursor-not-allowed">
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
