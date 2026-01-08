import React from 'react';
import { getTimeseriesData, getActiveSeries, getGeographies } from '@/lib/analytics';
import { assignSeriesColors } from '@/lib/analytics-colors';
import EconomicChart from '@/components/analytics/EconomicChart';
import FilterSidebar from '@/components/analytics/FilterSidebar';
import ActiveIndicatorCard from '@/components/analytics/ActiveIndicatorCard';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EconomicAnalyticsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const allSeries = await getActiveSeries();
    const geographies = await getGeographies();

    // Parse filters
    const seriesParam = params.series;

    // CENTRAL STATE: Decide which IDs are selected
    let selectedSeriesIds: number[] = [];
    const isInitialLoad = !seriesParam && !params.geos && !params.start && !params.end;

    if (seriesParam === 'none') {
        selectedSeriesIds = [];
    } else if (seriesParam) {
        selectedSeriesIds = String(seriesParam).split(',').map(Number);
    } else if (isInitialLoad) {
        // True initial load - default to verified treasury indicators
        // Swap 74 (broken) for 107 (verified data)
        selectedSeriesIds = [71, 107, 72];
    } else {
        // User cleared series but kept other filters
        selectedSeriesIds = [];
    }

    const selectedGeos = params.geos ? String(params.geos).split(',') : [];
    const startDate = params.start ? String(params.start) : undefined;
    const endDate = params.end ? String(params.end) : undefined;

    const rawData = await getTimeseriesData({
        seriesIds: selectedSeriesIds,
        geographies: selectedGeos,
        startDate,
        endDate,
        bucketInterval: '1 month',
    });

    // Get active metadata for visible series to support coloring and naming
    const activeMetadata = allSeries.filter(s => selectedSeriesIds.includes(s.series_id));

    // Assign Colors centrally
    const colorAssignments = assignSeriesColors(activeMetadata);

    // Transform data for Recharts (Pivot by time)
    // CRITICAL: Use s_{series_id} as the key to prevent naming collisions
    const chartDataMap: Record<string, any> = {};

    rawData.forEach(point => {
        // Stable timezone-aware ISO string for merging
        const timeStr = new Date(point.time).toISOString();
        if (!chartDataMap[timeStr]) {
            chartDataMap[timeStr] = { time: timeStr };
        }
        const key = `s_${point.series_id}`;
        // Force Number type to prevent string-based rendering issues in Recharts
        chartDataMap[timeStr][key] = point.value !== null ? Number(point.value) : null;
    });

    const chartData = Object.values(chartDataMap).sort((a: any, b: any) =>
        new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
            <div className="container mx-auto py-12 px-6">

                {/* Header Section */}
                <header className="mb-12 relative">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <h1 className="text-6xl font-black mb-4 tracking-tighter bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-blue-500 bg-clip-text text-transparent">
                            Economic Engine
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                            Real-time market correlations powered by <span className="text-blue-500 font-bold">TimescaleDB</span>.
                            Analyze trends with hyper-granular precision.
                        </p>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar */}
                    <FilterSidebar allSeries={allSeries} geographies={geographies} selectedIds={selectedSeriesIds} />

                    {/* Main Analytics Area */}
                    <main className="flex-1 space-y-12">

                        {/* Chart Area */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-black tracking-tight uppercase tracking-widest text-slate-800 dark:text-slate-200">Correlation Intelligence</h2>
                                    <p className="text-[11px] font-black tracking-[0.1em] text-slate-400 uppercase mt-1">
                                        System comparing {activeMetadata.length} indicators • SCALE-AWARE AXIS MAPPING
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="px-4 py-2 bg-white/5 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                                        LIVE TELEMETRY
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000" />
                                <EconomicChart
                                    data={chartData}
                                    seriesMetadata={activeMetadata}
                                />
                            </div>
                        </section>

                        {/* Active Indicators Area */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">Active Indicators</h3>
                                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeMetadata.map(s => (
                                    <ActiveIndicatorCard
                                        key={s.series_id}
                                        id={s.series_id}
                                        name={s.series_name}
                                        geography={s.geography}
                                        frequency={s.frequency}
                                        units={s.units}
                                        currentSeriesIds={selectedSeriesIds}
                                        chartColor={colorAssignments[s.series_id]}
                                    />
                                ))}

                                {selectedSeriesIds.length === 0 && (
                                    <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-100/5 backdrop-blur-sm">
                                        <p className="text-slate-500 font-black tracking-widest uppercase text-xs italic opacity-50">Select an indicator to begin analysis</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}
