'use client';

import { useState, useEffect } from 'react';
import { useSession, CustomUser } from '@/lib/auth-client';
import { authClient } from '@/lib/auth-client';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@chronos/ui/components/button';
import { AvatarUpload } from '@/components/profile/AvatarUpload';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as unknown as CustomUser | undefined;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (user) {
        // Use firstName/lastName if set, otherwise parse from name field
        const parsedFirstName = user.firstName || (user.name?.split(' ')[0] ?? '');
        const parsedLastName = user.lastName || (user.name?.split(' ').slice(1).join(' ') ?? '');
        setFirstName(parsedFirstName);
        setLastName(parsedLastName);
    }
  }, [user]);

  if (!user) return null;

  const isDirty = firstName !== (user.firstName ?? '') ||
                  lastName !== (user.lastName ?? '');

  async function handleSave() {
    setSaveState('saving');
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          name: `${firstName} ${lastName}`.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }

  function handleCancel() {
    setFirstName(user?.firstName ?? user?.name?.split(' ')[0] ?? '');
    setLastName(user?.lastName ?? user?.name?.split(' ').slice(1).join(' ') ?? '');
    setSaveState('idle');
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        <p className="text-gray-400 mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <AvatarUpload
              currentImage={user.image}
              userName={firstName || user.name || user.email || 'U'}
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{firstName} {lastName}</h3>
              <p className="text-sm text-gray-400 max-w-[200px]">Update your public profile information here.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                placeholder="First Name"
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                placeholder="Last Name"
              />
            </div>
            <div className="space-y-2 text-white md:col-span-2">
              <label className="text-sm font-medium text-gray-400">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-gray-400 cursor-not-allowed outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {user.emailVerified ? (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      <ShieldAlert className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-end gap-3">
          {saveState === 'success' && (
            <span className="text-sm text-emerald-400">Saved successfully!</span>
          )}
          {saveState === 'error' && (
            <span className="text-sm text-red-400">Failed to save. Try again.</span>
          )}
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={handleCancel}
            disabled={!isDirty || saveState === 'saving'}
          >
            Cancel
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            onClick={handleSave}
            disabled={!isDirty || saveState === 'saving'}
          >
            {saveState === 'saving' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
