"use client";

import React, { useState } from 'react';
import GeospatialMapWrapper from '@/components/analytics/map/GeospatialMapWrapper';
import { X, Activity, TrendingUp, Home } from 'lucide-react';

export default function GeospatialPage() {
    // State
    const [selectedMetric, setSelectedMetric] = useState<'unemployment' | 'hpi' | null>('unemployment');
    const [date, setDate] = useState<string | undefined>(undefined);

    // Metric Definitions
    const metrics = {
        unemployment: {
            id: 'unemployment',
            label: 'Unemployment Rate',
            unit: 'Percent',
            frequency: 'Monthly',
            icon: Activity,
            description: 'The percentage of the labor force that is jobless.'
        },
        hpi: {
            id: 'hpi',
            label: 'All-Transactions House Price Index',
            unit: 'Index 1980=100',
            frequency: 'Quarterly',
            icon: Home,
            description: 'Broad measure of the movement of single-family house prices.'
        }
    };

    const currentMetric = selectedMetric ? metrics[selectedMetric] : null;

    return (
        <div className="flex h-screen bg-[#020617] text-white overflow-hidden font-sans selection:bg-blue-500/30">

            {/* Custom Sidebar for Geospatial Only */}
            <aside className="w-80 border-r border-slate-800 bg-[#020617]/50 hidden lg:flex flex-col p-6 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                         <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest uppercase rounded-full border border-blue-500/20">
                            Geospatial
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Regional<br/>Intelligence
                    </h1>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        High-precision vector mapping of North American macroeconomic indicators.
                    </p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Available Metrics</h3>

                    <button
                        onClick={() => setSelectedMetric('unemployment')}
                        className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${
                            selectedMetric === 'unemployment'
                            ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_-10px_#3b82f6]'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                        }`}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedMetric === 'unemployment' ? 'text-blue-400' : 'text-slate-500'}`}>
                                    Labor Market
                                </span>
                                <Activity className={`w-4 h-4 ${selectedMetric === 'unemployment' ? 'text-blue-400' : 'text-slate-600'}`} />
                            </div>
                            <div className={`font-bold text-sm ${selectedMetric === 'unemployment' ? 'text-white' : 'text-slate-400'}`}>
                                Unemployment Rate
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setSelectedMetric('hpi')}
                        className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${
                            selectedMetric === 'hpi'
                            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_-10px_#10b981]'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                        }`}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedMetric === 'hpi' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    Housing
                                </span>
                                <Home className={`w-4 h-4 ${selectedMetric === 'hpi' ? 'text-emerald-400' : 'text-slate-600'}`} />
                            </div>
                            <div className={`font-bold text-sm ${selectedMetric === 'hpi' ? 'text-white' : 'text-slate-400'}`}>
                                House Price Index
                            </div>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    <div className="max-w-[1600px] mx-auto space-y-6 h-full flex flex-col">

                        {/* Map Area */}
                        <div className="flex-1 relative min-h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#020617]">
                            <GeospatialMapWrapper metric={selectedMetric || 'unemployment'} date={date} />

                            {/* Overlay Title if desired, or keep clean */}
                            <div className="absolute top-6 left-6 z-[400] pointer-events-none">
                                <h2 className="text-2xl font-bold text-white drop-shadow-md">
                                    {metricLabel(selectedMetric)}
                                </h2>
                                <p className="text-sm text-slate-300 drop-shadow-md">
                                    {selectedMetric === 'unemployment' ? 'Percentage of Labor Force' : 'All-Transactions Index'}
                                </p>
                            </div>
                        </div>

                        {/* Active Indicators Area */}
                        {currentMetric && (
                            <div className="relative shrink-0 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                                <div className="bg-[#0B1221]/80 backdrop-blur-md border border-slate-800 rounded-xl p-6">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        Active Selection
                                    </h3>

                                    <div className="flex flex-wrap gap-4">
                                        <div className="w-full md:w-96 bg-[#0f172a] border border-blue-500/30 rounded-lg p-4 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-900">
                                                        North America
                                                    </span>
                                                    <button
                                                        onClick={() => setSelectedMetric(null)}
                                                        className="text-slate-500 hover:text-white transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <h4 className="text-lg font-bold text-white mb-1">
                                                    {currentMetric.label}
                                                </h4>
                                                <p className="text-xs text-slate-400 mb-4 line-clamp-1">
                                                    {currentMetric.description}
                                                </p>

                                                <div className="flex items-center gap-6 border-t border-slate-800 pt-3">
                                                    <div>
                                                        <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Frequency</div>
                                                        <div className="text-xs text-blue-300 font-mono flex items-center gap-1.5">
                                                            <Activity className="w-3 h-3" />
                                                            {currentMetric.frequency}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Unit</div>
                                                        <div className="text-xs text-slate-300 font-mono">
                                                            {currentMetric.unit}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-cyan-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!selectedMetric && (
                           <div className="h-32 flex items-center justify-center border border-slate-800 border-dashed rounded-xl bg-slate-900/20">
                                <p className="text-slate-500 text-sm">Select a metric from the sidebar to visualize</p>
                           </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}

function metricLabel(metric: 'unemployment' | 'hpi' | null) {
    if (!metric) return 'North America Map';
    return metric === 'unemployment' ? 'Unemployment Rate' : 'House Price Index';
}
