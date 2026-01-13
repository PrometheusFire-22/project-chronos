// apps/web/app/(frontend)/analytics/geospatial/page.tsx
// Geospatial dashboard page with interactive choropleth maps

'use client';

import { useState } from 'react';
import GeospatialMap from '@/components/analytics/GeospatialMap';
import MapLegend from '@/components/analytics/MapLegend';
import AnalyticsNav from '@/components/analytics/AnalyticsNav';

type Geography = 'US' | 'CANADA';
type Level = 'state' | 'province' | 'county';

export default function GeospatialPage() {
  const [selectedGeography, setSelectedGeography] = useState<Geography>('US');
  const [selectedCategory, setSelectedCategory] = useState<'Employment' | 'Housing'>('Employment');
  const [legendData, setLegendData] = useState<{
    min: number;
    max: number;
    units: string;
    seriesName: string;
  } | null>(null);

  const geographyOptions: { value: Geography; label: string; level: Level }[] = [
    { value: 'US', label: 'United States', level: 'state' },
    { value: 'CANADA', label: 'Canada', level: 'province' },
  ];

  const categoryOptions: { value: 'Employment' | 'Housing'; label: string; description: string }[] = [
    { value: 'Employment', label: 'Unemployment Rate', description: 'State/provincial unemployment rates' },
    { value: 'Housing', label: 'House Price Index', description: 'All-transactions house price indices' },
  ];

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
          <div className="xl:col-span-1 space-y-6">
            {/* Category Selector */}
            <div className="p-6 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300 mb-4">
                Economic Indicator
              </h3>
              <div className="flex flex-col gap-2">
                {categoryOptions.map((option) => {
                  const isSelected = selectedCategory === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedCategory(option.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border text-left ${isSelected
                          ? 'bg-blue-500/10 border-blue-500/50 text-blue-500 shadow-[0_0_15px_-5px_#60a5fa]'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400'
                        } hover:scale-[1.02]`}
                    >
                      <div className="font-bold">{option.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{option.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Geography Selector */}
            <div className="p-6 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300 mb-4">
                Region
              </h3>
              <div className="flex flex-col gap-2">
                {geographyOptions.map((option) => {
                  const isSelected = selectedGeography === option.value;
                  const isCanada = option.value === 'CANADA';
                  const isUS = option.value === 'US';

                  let colorClasses = 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400';
                  if (isSelected) {
                    if (isCanada) colorClasses = 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_15px_-5px_#f87171]';
                    else if (isUS) colorClasses = 'bg-blue-500/10 border-blue-500/50 text-blue-500 shadow-[0_0_15px_-5px_#60a5fa]';
                  }

                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedGeography(option.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border ${colorClasses} hover:scale-[1.02]`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
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
                  geography={selectedGeography}
                  level={geographyOptions.find(o => o.value === selectedGeography)?.level || 'state'}
                  category={selectedCategory}
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
