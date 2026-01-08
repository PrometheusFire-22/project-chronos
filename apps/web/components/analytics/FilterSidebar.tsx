"use client";

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@chronos/ui/components/button';
import { Input } from '@chronos/ui/components/input';
import { Label } from '@chronos/ui/components/label';

interface SeriesMetadata {
    series_id: number;
    series_name: string;
    geography: string;
}

interface FilterSidebarProps {
    allSeries: SeriesMetadata[];
    geographies: string[];
    selectedIds: number[];
}

export default function FilterSidebar({ allSeries, geographies, selectedIds }: FilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedGeos = searchParams.get('geos')?.split(',') || [];
    const start = searchParams.get('start') || '';
    const end = searchParams.get('end') || '';

    const updateParams = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, val]) => {
            if (val) params.set(key, val);
            else params.delete(key);
        });
        router.push(`${pathname}?${params.toString()}`);
    }

    const handleToggleSeries = (id: number) => {
        let newIds = [...selectedIds];
        if (newIds.includes(id)) {
            newIds = newIds.filter(i => i !== id);
        } else {
            if (newIds.length < 5) newIds.push(id);
        }

        if (newIds.length === 0) {
            updateParams({ series: 'none' });
        } else {
            updateParams({ series: newIds.join(',') });
        }
    };

    const handleToggleGeo = (geo: string) => {
        let newGeos = [...selectedGeos];
        if (newGeos.includes(geo)) {
            newGeos = newGeos.filter(g => g !== geo);
        } else {
            newGeos.push(geo);
        }
        updateParams({ geos: newGeos.length > 0 ? newGeos.join(',') : null });
    };

    const clearAllFilters = () => {
        // REQUIREMENT: Clear everything, including default indicators.
        // We navigate to /?series=none to signal "empty" instead of "default".
        router.push(`${pathname}?series=none`);
    };

    // Filter series based on selected geography
    const filteredSeries = allSeries.filter(s =>
        selectedGeos.length === 0 || selectedGeos.includes(s.geography)
    );

    const getGeoGlowClass = (geo: string, isSelected: boolean) => {
        const g = geo.toUpperCase();
        if (g.includes('UNITED STATES') || g === 'US') {
            return isSelected
                ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]'
                : 'hover:border-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] text-slate-400';
        }
        if (g === 'CANADA' || g === 'CA') {
            return isSelected
                ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]'
                : 'hover:border-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] text-slate-400';
        }
        return isSelected ? 'bg-slate-700 border-slate-700 text-white' : 'text-slate-400 hover:border-slate-500';
    };

    const getIndicatorTagClass = (geo: string) => {
        const g = geo.toUpperCase();
        if (g.includes('UNITED STATES') || g === 'US') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        if (g === 'CANADA' || g === 'CA') return 'text-red-500 bg-red-500/10 border-red-500/20';
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }

    return (
        <aside className="w-full md:w-72 space-y-8 p-6 bg-white/5 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-2xl self-start">
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Time Horizon</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 ml-1">STARTING FROM</Label>
                        <Input
                            type="date"
                            value={start}
                            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
                            onChange={(e) => updateParams({ start: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 ml-1">UP UNTIL</Label>
                        <Input
                            type="date"
                            value={end}
                            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
                            onChange={(e) => updateParams({ end: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Geographic Focus</h3>
                <div className="flex flex-wrap gap-2.5">
                    {geographies.map(geo => (
                        <button
                            key={geo}
                            onClick={() => handleToggleGeo(geo)}
                            className={`px-4 py-2 text-[11px] font-black rounded-full border transition-all duration-300 uppercase tracking-wider ${getGeoGlowClass(geo, selectedGeos.includes(geo))}`}
                        >
                            {geo}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Indicator Catalog</h3>
                    <span className="text-[10px] font-black px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 font-mono">
                        {selectedIds.length}/5
                    </span>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 custom-scrollbar">
                    {filteredSeries.map(s => (
                        <button
                            key={s.series_id}
                            onClick={() => handleToggleSeries(s.series_id)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group hover:translate-x-1 ${selectedIds.includes(s.series_id)
                                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-100'
                                    : 'bg-white/5 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                                }`}
                        >
                            <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border inline-block mb-2 ${getIndicatorTagClass(s.geography)}`}>
                                {s.geography}
                            </div>
                            <div className="text-[12px] font-bold leading-snug group-hover:text-white transition-colors">
                                {s.series_name}
                            </div>
                        </button>
                    ))}
                    {filteredSeries.length === 0 && (
                        <div className="text-center py-12 text-slate-600 text-[10px] font-black tracking-widest uppercase italic bg-slate-100/5 rounded-2xl border border-dashed border-slate-800">
                            No indicators available
                        </div>
                    )}
                </div>
            </div>

            <Button
                variant="ghost"
                className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                onClick={clearAllFilters}
            >
                Clear Global Filters
            </Button>
        </aside>
    );
}
