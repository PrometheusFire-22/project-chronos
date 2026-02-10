'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Activity, Network, Database, Globe } from 'lucide-react'
import { Button } from '@chronos/ui/components/button'
import type { HomepageHero } from '@/lib/directus'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

interface HeroSectionProps {
  data: HomepageHero
}

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-16 pb-32 md:pt-24 lg:pt-32">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Column: Copy */}
          <motion.div
            variants={staggerContainer}
            initial="visible"
            animate="visible"
            className="flex flex-col gap-6"
          >
            {/* Pill */}
            <motion.div variants={fadeIn} className="flex items-start">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  v1.0 Public Beta Live
               </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeIn}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-[1.1]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-purple-500 to-indigo-500">
                  {data.headline}
                </span>
              </h1>
              {data.subheadline && (
                <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed">
                  {data.subheadline}
                </p>
              )}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link href={data.cta_primary_link}>
                <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-200 font-semibold h-12 px-8 text-base">
                  {data.cta_primary_text} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {data.cta_secondary_text && data.cta_secondary_link && (
                <Link href={data.cta_secondary_link}>
                  <Button variant="outline" size="lg" className="border-slate-800 text-white hover:bg-slate-800 h-12 px-8 text-base">
                    {data.cta_secondary_text}
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Tags */}
            <motion.div variants={fadeIn} className="mt-8 pt-8 border-t border-slate-800/50 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Network size={16} className="text-purple-400"/> Graph Analysis</span>
                <span className="flex items-center gap-1.5"><Database size={16} className="text-indigo-400"/> Vector Search</span>
                <span className="flex items-center gap-1.5"><Globe size={16} className="text-pink-400"/> Geospatial Ops</span>
            </motion.div>

          </motion.div>

          {/* Right Column: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative lg:h-[600px] w-full flex items-center justify-center p-8 lg:p-0"
          >
             {/* Glowing Card Effect */}
             <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-3xl border border-white/5 backdrop-blur-sm -z-10" />

             {/* The Graph Illustration */}
             <Image
                src="/illustrations/hero-graph.svg"
                alt="Graph Network Visualization"
                width={600}
                height={500}
                className="w-full h-auto drop-shadow-2xl"
                priority
             />

             {/* Floating Elements (Decorative) */}
             <motion.div
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-1/4 right-0 p-4 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl shadow-xl max-w-[200px]"
             >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                       <Activity size={16} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400">Signal Strength</div>
                        <div className="text-sm font-bold text-white">98.4% Match</div>
                    </div>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[98%]" />
                </div>
             </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  )
}
