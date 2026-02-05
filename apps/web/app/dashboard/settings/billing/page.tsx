'use client';

import { CreditCard, Zap, Check } from 'lucide-react';
import { Button } from '@chronos/ui/components/button';

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Billing & Plans</h2>
        <p className="text-gray-400 mt-1">Manage your subscription and billing details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan Card */}
        <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-50">
            <Zap className="w-24 h-24 text-purple-500/10 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="relative z-10 space-y-6">
            <div>
              <div className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-2">Current Plan</div>
              <h3 className="text-3xl font-bold text-white">Free Tier</h3>
            </div>

            <div className="space-y-3">
              {['3 PDF Uploads / Month', '120 Pages / Month', 'Basic Analytics'].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-gray-300">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-white text-black hover:bg-gray-200 font-semibold">
              Upgrade to Pro
            </Button>
          </div>
        </div>

        {/* Payment Method Placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">No Payment Method</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mt-2">
              Add a payment method to upgrade your plan and unlock premium features.
            </p>
          </div>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 mt-2">
            Add Payment Method
          </Button>
        </div>
      </div>
    </div>
  );
}
