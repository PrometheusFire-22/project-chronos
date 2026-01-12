// apps/web/app/(frontend)/analytics/geospatial/page.tsx
// Geospatial dashboard page with interactive choropleth maps

'use client';

import { useState } from 'react';
import GeospatialMap from '@/components/analytics/GeospatialMap';
import MapLegend from '@/components/analytics/MapLegend';
import AnalyticsNav from '@/components/analytics/AnalyticsNav';

export default function GeospatialPage() {
  const [legendData, setLegendData] = useState<{
    min: number;
    max: number;
    units: string;
    seriesName: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <div className="container mx-auto py-12 px-6">
        <header className="mb-12 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold tracking-widest uppercase rounded-full border border-blue-500/20">
                  Spatial Intelligence
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                Geospatial Analytics
              </h1>
              <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-medium">
                Visualize economic indicators across geographic regions with interactive choropleth maps.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <AnalyticsNav />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-1">
            {legendData && (
              <MapLegend
                title={legendData.seriesName}
                min={legendData.min}
                max={legendData.max}
                units={legendData.units}
              />
            )}
          </div>

          <div className="xl:col-span-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative">
                <GeospatialMap
                  geography="US"
                  level="state"
                  seriesId="71"
                  height="700px"
                  onFeatureClick={(id, name) => {
                    console.log('Clicked:', { id, name });
                  }}
                  onDataLoad={setLegendData}
                />
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-200 dark:border-blue-800/50">
              <h3 className="text-sm font-bold tracking-widest uppercase text-blue-900 dark:text-blue-100 mb-2">
                About This Dashboard
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed mb-3">
                Interactive choropleth maps visualizing economic time-series data across North American geographic regions.
                Click on regions to view detailed information.
              </p>
              <div className="p-3 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg border border-amber-300/50 dark:border-amber-700/50">
                <p className="text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
                  <strong>Note:</strong> Currently displaying demo data with sample unemployment rates by state/province.
                  Production version will integrate with actual state-level economic series from the database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
