'use client';

import { Shield, Key, Smartphone } from 'lucide-react';
import { Button } from '@chronos/ui/components/button';

export default function SecurityPage() {
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
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Change Password
            </Button>
          </div>
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
