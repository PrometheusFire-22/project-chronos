"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Activity } from 'lucide-react';

interface SeriesMetadata {
    series_id: number;
    series_name: string;
    geography: string;
    units: string;
    frequency: string;
}

interface ActiveIndicatorCardProps {
    series: SeriesMetadata;
    selectedSeriesIds: number[];
    chartColor?: string;
}

export default function ActiveIndicatorCard({
    series,
    selectedSeriesIds,
    chartColor = '#3b82f6'
}: ActiveIndicatorCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleRemove = () => {
        const params = new URLSearchParams(searchParams.toString());
        const newIds = selectedSeriesIds.filter(id => id !== series.series_id);

        if (newIds.length === 0) {
            params.set('series', 'none');
        } else {
            params.set('series', newIds.join(','));
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div
            className="relative group p-6 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 transition-all hover:shadow-2xl hover:scale-[1.03] overflow-hidden glow-orbit-container hover:bg-white/80 dark:hover:bg-slate-800/60"
            style={{
                boxShadow: `0 10px 40px -15px ${chartColor}30`,
                '--orbit-color': chartColor
            } as React.CSSProperties}
        >
            {/* Glow Orbit Border */}
            <div className="glow-orbit-border" />

            {/* Background Glow Accent */}
            <div
                className="absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 rounded-full pointer-events-none transition-opacity group-hover:opacity-40"
                style={{ backgroundColor: chartColor }}
            />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <span
                        className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all group-hover:scale-110"
                        style={{
                            backgroundColor: `${chartColor}15`,
                            borderColor: `${chartColor}40`,
                            color: chartColor
                        }}
                    >
                        {series.geography}
                    </span>
                    <button
                        onClick={handleRemove}
                        className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white transition-all overflow-hidden relative group/btn"
                    >
                        <div
                            className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                            style={{ backgroundColor: chartColor }}
                        />
                        <X className="w-4 h-4 relative z-10" />
                    </button>
                </div>

                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-tight min-h-[3rem] transition-transform group-hover:scale-[1.02] origin-left">
                    {series.series_name}
                </h4>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Frequency</span>
                        <div className="flex items-center gap-1.5">
                            <Activity className="w-3 h-3 transition-transform group-hover:rotate-12" style={{ color: chartColor }} />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                {series.frequency}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Unit</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                            {series.units}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div
                className="absolute bottom-0 left-0 w-full h-1 opacity-50"
                style={{ backgroundColor: chartColor }}
            />
        </div>
    );
}
