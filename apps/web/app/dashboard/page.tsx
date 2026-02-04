'use client'

import { motion } from 'framer-motion'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { User, Shield, Zap, FileText, Settings, CreditCard } from 'lucide-react'
import { Button } from '@chronos/ui/components/button'
import cn from '@chronos/ui'

export default function DashboardPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

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

  const user = session.user

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
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden selection:bg-purple-500/30">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 max-w-6xl">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-indigo-200">
                            Welcome back, {user.name}
                        </h1>
                        <p className="text-gray-400 mt-2">Manage your account and view your analytics.</p>
                    </div>
                   <div className="flex gap-3">
                        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Button>
                   </div>
                </motion.div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Profile Card */}
                    <motion.div variants={itemVariants} className="md:col-span-1">
                        <div className="h-full p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col gap-6 relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-white/50" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{user.name}</h3>
                                    <p className="text-sm text-gray-400 truncate max-w-[150px]">{user.email}</p>
                                </div>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Shield className={cn("w-4 h-4", user.emailVerified ? "text-emerald-400" : "text-amber-400")} />
                                        <span className="text-sm text-gray-300">Account Status</span>
                                    </div>
                                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", user.emailVerified ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300")}>
                                        {user.emailVerified ? "Verified" : "Unverified"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3">
                                         <CreditCard className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm text-gray-300">Plan</span>
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
                        <div className="h-full p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                           <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        Usage Analytics
                                    </h3>
                                    <span className="text-xs text-gray-500">Monthly Cycle</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm text-gray-400">PDF Uploads</span>
                                            <FileText className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold">0</span>
                                            <span className="text-sm text-gray-500">/ 5</span>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-[0%]" />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm text-gray-400">Queries</span>
                                            <Zap className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold">0</span>
                                            <span className="text-sm text-gray-500">/ 50</span>
                                        </div>
                                         {/* Progress Bar */}
                                         <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-cyan-500 w-[0%]" />
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
    </div>
  )
}
