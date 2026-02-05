'use client';

import { useSession } from '@/lib/auth-client';
import { User, Mail, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@chronos/ui';
import { Button } from '@chronos/ui/components/button';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        <p className="text-gray-400 mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white/50" />
                  )}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-xs font-semibold text-white">Change</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{user.name}</h3>
              <p className="text-sm text-gray-400 max-w-[200px]">Update your public profile information here.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Full Name</label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                placeholder="Geoff Bevans"
              />
            </div>
            <div className="space-y-2 text-white">
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

        <div className="p-4 bg-white/[0.02] border-t border-white/10 flex justify-end gap-3">
          <Button variant="ghost" className="text-gray-400 hover:text-white">Cancel</Button>
          <Button className="bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
