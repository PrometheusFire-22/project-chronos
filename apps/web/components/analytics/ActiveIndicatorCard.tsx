"use client";

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X } from 'lucide-react';

interface ActiveIndicatorCardProps {
    id: number;
    name: string;
    geography: string;
    frequency: string;
    units: string;
    currentSeriesIds: number[];
    chartColor?: string; // Color assigned by the chart/mapper
}

export default function ActiveIndicatorCard({
    id,
    name,
    geography,
    frequency,
    units,
    currentSeriesIds,
    chartColor
}: ActiveIndicatorCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleRemove = () => {
        const params = new URLSearchParams(searchParams.toString());
        const newSeries = currentSeriesIds.filter(s => s !== id);

        if (newSeries.length > 0) {
            params.set('series', newSeries.join(','));
        } else {
            params.set('series', 'none');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const isCanada = geography.toUpperCase() === 'CANADA' || geography.toUpperCase() === 'CA';

    // Use assigned chart color if available, fallback to geography defaults
    const accentColor = chartColor || (isCanada ? '#f87171' : '#60a5fa');

    // Dynamic styles based on accent color
    const tagStyle = {
        color: accentColor,
        backgroundColor: `${accentColor}1A`, // 10% opacity
        borderColor: `${accentColor}33`   // 20% opacity
    };

    const buttonStyle = {
        backgroundColor: accentColor,
        boxShadow: `0 0 20px ${accentColor}66` // 40% opacity
    };

    const glowStyle = {
        backgroundColor: `${accentColor}1A` // 10% opacity
    };

    return (
        <div className="group relative p-6 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/40 shadow-sm hover:shadow-2xl transition-all duration-500 backdrop-blur-xl overflow-hidden active:scale-95">
            <div
                className="absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 transition-colors duration-500"
                style={glowStyle}
            />

            <div className="flex justify-between items-start mb-5 relative z-10">
                <div
                    className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border transition-all duration-500"
                    style={tagStyle}
                >
                    {geography}
                </div>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove();
                    }}
                    className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 border-white/20 hover:scale-110 active:scale-90"
                    style={buttonStyle}
                    title="Remove indicator"
                >
                    <X size={16} className="text-white" strokeWidth={4} />
                </button>
            </div>

            <div className="font-black text-xl text-slate-900 dark:text-white line-clamp-2 leading-tight mb-5 min-h-[3.5rem] relative z-10 tracking-tight">
                {name}
            </div>

            <div className="flex items-center gap-4 relative z-10 mb-1">
                <div
                    className="h-[2px] w-8 rounded-full opacity-50 transition-all duration-500"
                    style={{ backgroundColor: accentColor }}
                />
                <div className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    {frequency} • {units}
                </div>
            </div>
        </div>
    );
}
