import React from 'react';
import { ArrowRight, BarChart2, ShieldAlert, Zap } from 'lucide-react';

export const metadata = {
    title: 'Solutions - Strategic Credit Intelligence',
    description: 'Bespoke consulting and intelligence solutions for private credit and special situations.',
};

export default function SolutionsPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
            {/* Hero Section */}
            <div className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest text-blue-500 uppercase bg-blue-500/10 rounded-full border border-blue-500/20">
                            Consulting & Advisory
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-400">
                            Navigate the Liquidity Reset
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
                            We bridge the gap between messy unstructured data and actionable credit strategy.
                            Deploy our intelligence layer to identify contagion risks before they hit the headlines.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="/contact"
                                className="inline-flex items-center px-8 py-4 text-base font-bold text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                            >
                                Book a Consultation
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Value Props */}
            <div className="py-24 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                        {/* Feature 1 */}
                        <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldAlert className="w-7 h-7 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Risk Forensics</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Deep-dive analysis into portfolio contagion. We map hidden relationships between borrowers,
                                guarantors, and shell companies to expose systemic fragility.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BarChart2 className="w-7 h-7 text-violet-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Market Technographics</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Custom dashboards tracking liquidity flows, insolvency filings, and private credit yields.
                                See the market with higher resolution than your competitors.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Rapid Deployment</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                We engage as a strike team. No long implementations. We deliver actionable
                                intelligence briefs and raw data exports within days, not months.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
