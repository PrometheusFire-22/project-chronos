'use client';

import { CreditCard, Zap, Check, FileText } from 'lucide-react';
import { Button } from '@chronos/ui/components/button';
import { useUsage } from '@/hooks/useUsage';

function UsageBar({ label, value, limit, color, icon: Icon }: {
  label: string;
  value: number;
  limit: number;
  color: string;
  icon: typeof FileText;
}) {
  const pct = Math.min((value / limit) * 100, 100);
  return (
    <div className="p-4 rounded-xl bg-background/50 border border-border">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">/ {limit}</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { usage, isLoading } = useUsage();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Billing & Plans</h2>
        <p className="text-muted-foreground mt-1">Manage your subscription and billing details.</p>
      </div>

      {/* Usage Section */}
      <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Current Usage
          </h3>
          <span className="text-xs text-muted-foreground">Monthly Cycle</span>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UsageBar
              label="PDF Uploads"
              value={usage?.pdfUploadCount ?? 0}
              limit={usage?.pdfUploadLimit ?? 3}
              color="text-indigo-500"
              icon={FileText}
            />
            <UsageBar
              label="Total Pages"
              value={usage?.totalPageCount ?? 0}
              limit={usage?.totalPageLimit ?? 120}
              color="text-purple-500"
              icon={FileText}
            />
            <UsageBar
              label="Queries"
              value={usage?.queryCount ?? 0}
              limit={usage?.queryLimit ?? 5}
              color="text-cyan-500"
              icon={Zap}
            />
          </div>
        )}
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
                <div key={feature} className="flex items-center gap-2 text-gray-200">
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
        <div className="bg-card/50 border border-border rounded-2xl p-6 flex flex-col justify-center items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No Payment Method</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
              Add a payment method to upgrade your plan and unlock premium features.
            </p>
          </div>
          <Button variant="outline" className="border-border text-foreground hover:bg-muted mt-2">
            Add Payment Method
          </Button>
        </div>
      </div>
    </div>
  );
}
