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
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-purple-500/30">

            {/* Custom Sidebar for Geospatial Only */}
            <aside className="w-80 border-r border-border bg-muted/30 hidden lg:flex flex-col p-6 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                         <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold tracking-widest uppercase rounded-full border border-purple-500/20">
                            Geospatial
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        Regional<br/>Intelligence
                    </h1>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        High-precision vector mapping of North American macroeconomic indicators.
                    </p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Available Metrics</h3>

                    <button
                        onClick={() => setSelectedMetric('unemployment')}
                        className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${
                            selectedMetric === 'unemployment'
                            ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_-10px_#a855f7]'
                            : 'bg-card border-border hover:border-purple-500/30 hover:bg-purple-500/5'
                        }`}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedMetric === 'unemployment' ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'}`}>
                                    Labor Market
                                </span>
                                <Activity className={`w-4 h-4 ${selectedMetric === 'unemployment' ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'}`} />
                            </div>
                            <div className={`font-bold text-sm ${selectedMetric === 'unemployment' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Unemployment Rate
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setSelectedMetric('hpi')}
                        className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${
                            selectedMetric === 'hpi'
                            ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_-10px_#6366f1]'
                            : 'bg-card border-border hover:border-indigo-500/30 hover:bg-indigo-500/5'
                        }`}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedMetric === 'hpi' ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`}>
                                    Housing
                                </span>
                                <Home className={`w-4 h-4 ${selectedMetric === 'hpi' ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`} />
                            </div>
                            <div className={`font-bold text-sm ${selectedMetric === 'hpi' ? 'text-foreground' : 'text-muted-foreground'}`}>
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
                                <h2 className="text-2xl font-bold text-foreground drop-shadow-md">
                                    {metricLabel(selectedMetric)}
                                </h2>
                                <p className="text-sm text-muted-foreground drop-shadow-md">
                                    {selectedMetric === 'unemployment' ? 'Percentage of Labor Force' : 'All-Transactions Index'}
                                </p>
                            </div>
                        </div>

                        {/* Active Indicators Area */}
                        {currentMetric && (
                            <div className="relative shrink-0 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                                <div className="bg-card/80 backdrop-blur-md border border-border rounded-xl p-6">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                        Active Selection
                                    </h3>

                                    <div className="flex flex-wrap gap-4">
                                        <div className="w-full md:w-96 bg-background border border-purple-500/30 rounded-lg p-4 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                        North America
                                                    </span>
                                                    <button
                                                        onClick={() => setSelectedMetric(null)}
                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <h4 className="text-lg font-bold text-foreground mb-1">
                                                    {currentMetric.label}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
                                                    {currentMetric.description}
                                                </p>

                                                <div className="flex items-center gap-6 border-t border-border pt-3">
                                                    <div>
                                                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Frequency</div>
                                                        <div className="text-xs text-purple-600 dark:text-purple-300 font-mono flex items-center gap-1.5">
                                                            <Activity className="w-3 h-3" />
                                                            {currentMetric.frequency}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Unit</div>
                                                        <div className="text-xs text-muted-foreground font-mono">
                                                            {currentMetric.unit}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!selectedMetric && (
                           <div className="h-32 flex items-center justify-center border border-border border-dashed rounded-xl bg-card">
                                <p className="text-muted-foreground text-sm">Select a metric from the sidebar to visualize</p>
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
