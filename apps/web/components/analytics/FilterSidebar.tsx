"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Calendar, Globe, Database } from 'lucide-react';

interface SeriesMetadata {
    series_id: number;
    series_name: string;
    geography: string;
    units: string;
    frequency: string;
}

interface FilterSidebarProps {
    allSeries: SeriesMetadata[];
    geographies: string[];
    selectedSeriesIds: number[];
    selectedGeos: string[];
}

export default function FilterSidebar({
    allSeries,
    geographies,
    selectedSeriesIds,
    selectedGeos
}: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleToggleSeries = (id: number) => {
        const currentSeries = String(searchParams.get('series') || '');
        let newSeriesIds: number[] = [];

        if (currentSeries === 'none') {
            newSeriesIds = [id];
        } else if (!currentSeries) {
            // If it was initial load (empty params), start with the defaults [71, 107, 72] minus/plus toggle
            const defaults = [71, 107, 72];
            newSeriesIds = defaults.includes(id)
                ? defaults.filter(sid => sid !== id)
                : [...defaults, id];
        } else {
            const currentIds = currentSeries.split(',').map(Number);
            newSeriesIds = currentIds.includes(id)
                ? currentIds.filter(sid => sid !== id)
                : [...currentIds, id];
        }

        const params = new URLSearchParams(searchParams.toString());
        if (newSeriesIds.length === 0) {
            params.set('series', 'none');
        } else {
            params.set('series', newSeriesIds.join(','));
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleToggleGeo = (geo: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentGeos = params.get('geos')?.split(',') || [];
        const newGeos = currentGeos.includes(geo)
            ? currentGeos.filter(g => g !== geo)
            : [...currentGeos, geo];

        if (newGeos.length === 0) {
            params.delete('geos');
        } else {
            params.set('geos', newGeos.join(','));
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleClearAll = () => {
        router.push('?series=none', { scroll: false });
    };

    const filteredCatalog = selectedGeos.length > 0
        ? allSeries.filter(s => selectedGeos.includes(s.geography))
        : allSeries;

    return (
        <aside className="space-y-8 sticky top-8">
            {/* Time Controls */}
            <div className="p-6 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">Temporal Scope</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Starting From</label>
                        <input
                            type="date"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 ring-blue-500/20 outline-none transition-all"
                            onChange={(e) => {
                                const params = new URLSearchParams(searchParams.toString());
                                if (e.target.value) params.set('start', e.target.value);
                                else params.delete('start');
                                router.push(`?${params.toString()}`, { scroll: false });
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Up Until</label>
                        <input
                            type="date"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 ring-blue-500/20 outline-none transition-all"
                            onChange={(e) => {
                                const params = new URLSearchParams(searchParams.toString());
                                if (e.target.value) params.set('end', e.target.value);
                                else params.delete('end');
                                router.push(`?${params.toString()}`, { scroll: false });
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Geographic Focus */}
            <div className="p-6 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">Geographic Focus</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {geographies.map(geo => (
                        <button
                            key={geo}
                            onClick={() => handleToggleGeo(geo)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedGeos.includes(geo)
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400'
                                }`}
                        >
                            {geo.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Indicator Catalog */}
            <div className="p-6 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">Indicator Catalog</h3>
                    </div>
                    <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
                        {selectedSeriesIds.length}/{allSeries.length}
                    </span>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredCatalog.map(series => (
                        <button
                            key={series.series_id}
                            onClick={() => handleToggleSeries(series.series_id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all group ${selectedSeriesIds.includes(series.series_id)
                                ? 'bg-blue-500/5 border-blue-500/40'
                                : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                                }`}
                        >
                            <div className="flex flex-col gap-1">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${selectedSeriesIds.includes(series.series_id) ? 'text-blue-500' : 'text-slate-400'}`}>
                                    {series.geography}
                                </span>
                                <span className={`text-sm font-bold leading-tight ${selectedSeriesIds.includes(series.series_id) ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {series.series_name}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleClearAll}
                    className="w-full mt-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                >
                    Clear Global Filters
                </button>
            </div>
        </aside>
    );
}
