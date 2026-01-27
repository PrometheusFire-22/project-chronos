import React from 'react';
import { getTimeseriesData, getActiveSeries, getGeographies } from '@/lib/analytics';
import { assignSeriesColors } from '@/lib/analytics-colors';
import EconomicChart from '@/components/analytics/EconomicChart';
import FilterSidebar from '@/components/analytics/FilterSidebar';
import ActiveIndicatorCard from '@/components/analytics/ActiveIndicatorCard';


export const dynamic = 'force-dynamic';
// Using Node.js runtime for database operations with Cloudflare Hyperdrive

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EconomicAnalyticsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    let allSeries: any[] = [];
    let geographies: string[] = [];
    let rawData: any[] = [];
    let errorMsg: string | null = null;
    let selectedSeriesIds: number[] = [];

    // Capture environment state for debugging
    const dbVar = process.env.DB;
    const dbUrlVar = process.env.DATABASE_URL;
    const envDiagnostics = {
        DB_TYPE: typeof dbVar,
        DB_EXISTS: !!dbVar,
        DB_URL_TYPE: typeof dbUrlVar,
        DB_URL_EXISTS: !!dbUrlVar,
        NODE_ENV: process.env.NODE_ENV,
    };

    try {
        allSeries = await getActiveSeries();
        geographies = await getGeographies();

        // Determine currently selected series
        const seriesParam = params.series;
        const isInitialLoad = !seriesParam;

        if (seriesParam && seriesParam !== 'none') {
            selectedSeriesIds = String(seriesParam).split(',').map(Number);
        } else if (isInitialLoad) {
            // True initial load - default to verified treasury indicators
            selectedSeriesIds = [71, 107, 72];
        } else {
            // User cleared series but kept other filters
            selectedSeriesIds = [];
        }

        const selectedGeos = params.geos ? String(params.geos).split(',') : [];
        const startDate = params.start ? String(params.start) : undefined;
        const endDate = params.end ? String(params.end) : undefined;

        rawData = await getTimeseriesData({
            seriesIds: selectedSeriesIds,
            geographies: selectedGeos,
            startDate,
            endDate,
            bucketInterval: '1 month',
        });
    } catch (e: any) {
        console.error('Runtime Error:', e);
        errorMsg = e.message || String(e);
    }

    if (errorMsg) {
        return (
            <div className="p-12 text-center bg-slate-900 min-h-screen text-white font-sans">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-red-500 mb-6 flex items-center justify-center gap-3">
                        <span className="p-2 bg-red-500/10 rounded-lg">⚠️</span>
                        Cloudflare Runtime Exception
                    </h1>
                    <div className="p-8 bg-slate-800/50 rounded-2xl border border-red-500/20 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-left">Error Surface</h3>
                        <pre className="p-6 bg-black/40 rounded-xl overflow-auto text-left text-sm font-mono text-red-400 border border-white/5 whitespace-pre-wrap mb-8">
                            {errorMsg}
                        </pre>

                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-left">Diagnostics</h3>
                        <div className="grid grid-cols-2 gap-4 text-left">
                            {Object.entries(envDiagnostics).map(([key, val]) => (
                                <div key={key} className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] text-slate-500 uppercase">{key}</div>
                                    <div className="text-sm font-mono text-emerald-400">{String(val)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 text-left">
                            <h4 className="text-sm font-bold text-white mb-2">Checklist</h4>
                            <ul className="text-xs space-y-2 text-slate-400">
                                <li>• Ensure Hyperdrive binding named <code className="text-emerald-400 font-mono">DB</code> is attached to the Pages project.</li>
                                <li>• Verify that the DB secret is not being overwritten by a plain string in Settings.</li>
                                <li>• Confirm any <code className="text-emerald-400 font-mono">NODE_VERSION</code> requirements (Standard is 20+).</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const activeMetadata = allSeries.filter(s => selectedSeriesIds.includes(s.series_id));
    const colorAssignments = assignSeriesColors(activeMetadata);
    const chartDataMap: Record<string, any> = {};

    rawData.forEach(point => {
        try {
            const timeStr = new Date(point.time).toISOString();
            if (!chartDataMap[timeStr]) {
                chartDataMap[timeStr] = { time: timeStr };
            }
            const key = `s_${point.series_id}`;
            chartDataMap[timeStr][key] = point.value !== null ? Number(point.value) : null;
        } catch (err) {
            // Ignore malformed points
        }
    });

    const chartData = Object.values(chartDataMap).sort((a: any, b: any) =>
        new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
            <div className="container mx-auto py-12 px-6">
                <header className="mb-12 relative">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold tracking-widest uppercase rounded-full border border-blue-500/20">
                                    Correlation Intelligence
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                                Global Economic Analytics
                            </h1>
                            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-medium">
                                Cross-pollinate macroeconomic indicators with real-time telemetry to discover hidden market signals.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-1">
                        <FilterSidebar
                            allSeries={allSeries}
                            geographies={geographies}
                            selectedSeriesIds={selectedSeriesIds}
                            selectedGeos={params.geos ? String(params.geos).split(',') : []}
                        />
                    </div>

                    <div className="xl:col-span-3 space-y-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                            <div className="relative">
                                <EconomicChart
                                    data={chartData}
                                    seriesMetadata={activeMetadata}
                                />
                            </div>
                        </div>



                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-500">
                                    Active Indicators
                                </h3>
                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeMetadata.map((series) => (
                                    <ActiveIndicatorCard
                                        key={series.series_id}
                                        series={series}
                                        selectedSeriesIds={selectedSeriesIds}
                                        chartColor={colorAssignments[series.series_id]}
                                    />
                                ))}
                                {activeMetadata.length === 0 && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                        <p className="text-sm font-medium">No indicators selected. Choose from the catalog to begin analysis.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
