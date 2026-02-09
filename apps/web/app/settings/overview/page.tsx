'use client'

import { motion } from 'framer-motion'
import { useSession, CustomUser } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, Shield, Zap, FileText, Settings, CreditCard } from 'lucide-react'
import { Button } from '@chronos/ui/components/button'
import { cn } from '@chronos/ui'
import { useUsage } from '@/hooks/useUsage'

export default function DashboardPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const { usage } = useUsage();
  const [verificationState, setVerificationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in')
    }
  }, [session, isPending, router])

  if (isPending || !session) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    )
  }

  const user = session.user as unknown as CustomUser

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100 }
    }
  }

  return (
    <div className="space-y-8">
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-purple-500 to-indigo-500">
                        Overview
                    </h1>
                    <p className="text-muted-foreground mt-2">Welcome back, {user.firstName}. View your activity and usage.</p>
                </div>
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Profile Card */}
                <motion.div variants={itemVariants} className="md:col-span-1">
                    <div className="h-full p-6 bg-card/50 backdrop-blur-xl border border-border rounded-2xl flex flex-col gap-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 p-[2px]">
                                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                    {user.image ? (
                                        <img src={user.image} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                                <p className="text-sm text-gray-400 truncate max-w-[150px]">{user.email}</p>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                                <div className="flex items-center gap-3">
                                    <Shield className={cn("w-4 h-4", user.emailVerified ? "text-emerald-500" : "text-amber-500")} />
                                    <span className="text-sm text-muted-foreground">Account Status</span>
                                </div>
                                <span className={cn("text-xs font-medium px-2 py-1 rounded-full", user.emailVerified ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300")}>
                                    {user.emailVerified ? "Verified" : "Unverified"}
                                </span>
                            </div>

                            {/* Resend Verification Button */}
                            {!user.emailVerified && (
                                <button
                                    onClick={async () => {
                                        setVerificationState('loading');
                                        try {
                                            const response = await fetch('/api/auth/send-verification-email', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ email: user.email }),
                                            });

                                            if (response.ok) {
                                                setVerificationState('success');
                                                setTimeout(() => setVerificationState('idle'), 5000);
                                            } else {
                                                setVerificationState('error');
                                                setTimeout(() => setVerificationState('idle'), 3000);
                                            }
                                        } catch (error) {
                                            setVerificationState('error');
                                            setTimeout(() => setVerificationState('idle'), 3000);
                                        }
                                    }}
                                    disabled={verificationState === 'loading' || verificationState === 'success'}
                                    className={cn(
                                        "w-full p-3 rounded-lg border text-sm font-medium transition-all duration-300",
                                        verificationState === 'success'
                                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 cursor-default"
                                            : verificationState === 'error'
                                            ? "bg-red-500/20 border-red-500/30 text-red-300"
                                            : "bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground/20"
                                    )}
                                >
                                    {verificationState === 'loading' && (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </span>
                                    )}
                                    {verificationState === 'success' && (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Email Sent!
                                        </span>
                                    )}
                                    {verificationState === 'error' && "Failed to send"}
                                    {verificationState === 'idle' && "Resend Verification Email"}
                                </button>
                            )}
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                                <div className="flex items-center gap-3">
                                        <CreditCard className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm text-muted-foreground">Plan</span>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                                    Free Tier
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats / RAG Placeholder */}
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <div className="h-full p-6 bg-card/50 backdrop-blur-xl border border-border rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    Usage Analytics
                                </h3>
                                <span className="text-xs text-muted-foreground">Monthly Cycle</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* PDF Uploads */}
                                {/* PDF Uploads */}
                                <div className="p-4 rounded-xl bg-background/50 border border-border">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm text-muted-foreground">PDF Uploads</span>
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">{usage?.pdfUploadCount ?? 0}</span>
                                        <span className="text-sm text-muted-foreground">/ {usage?.pdfUploadLimit ?? 3}</span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 transition-all duration-500"
                                            style={{ width: `${Math.min(((usage?.pdfUploadCount ?? 0) / (usage?.pdfUploadLimit ?? 3)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Pages (Token Proxy) */}
                                <div className="p-4 rounded-xl bg-background/50 border border-border">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm text-muted-foreground">Total Pages</span>
                                        <FileText className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">{usage?.totalPageCount ?? 0}</span>
                                        <span className="text-sm text-muted-foreground">/ {usage?.totalPageLimit ?? 120}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 transition-all duration-500"
                                            style={{ width: `${Math.min(((usage?.totalPageCount ?? 0) / (usage?.totalPageLimit ?? 120)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Queries */}
                                <div className="p-4 rounded-xl bg-background/50 border border-border">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm text-muted-foreground">Queries</span>
                                        <Zap className="w-4 h-4 text-cyan-500" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">{usage?.queryCount ?? 0}</span>
                                        <span className="text-sm text-muted-foreground">/ {usage?.queryLimit ?? 5}</span>
                                    </div>
                                        {/* Progress Bar */}
                                        <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="h-full bg-cyan-500 transition-all duration-500"
                                            style={{ width: `${Math.min(((usage?.queryCount ?? 0) / (usage?.queryLimit ?? 5)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-8">
                            <h4 className="text-sm font-medium text-gray-400 mb-4">Quick Actions</h4>
                            <div className="flex gap-3">
                                <Button disabled className="bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300">
                                    Upload Document (Coming Soon)
                                </Button>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </motion.div>
    </div>
  )
}
