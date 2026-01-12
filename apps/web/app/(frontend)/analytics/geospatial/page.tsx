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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <AnalyticsNav />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Geospatial Analytics
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore economic indicators across geographic regions with interactive choropleth maps.
          </p>
        </div>

        {/* Map Container */}
        <div className="space-y-12">
          {/* Example: US States Unemployment Rate */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                US States - Unemployment Rate
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Unemployment rate by state across the United States.
              </p>
            </div>
            <div className="grid lg:grid-cols-[1fr_300px] gap-6">
              <GeospatialMap
                geography="US"
                level="state"
                seriesId="1"
                height="600px"
                onFeatureClick={(id, name) => {
                  console.log('Clicked:', { id, name });
                }}
                onDataLoad={setLegendData}
              />
              {legendData && (
                <MapLegend
                  title={legendData.seriesName}
                  min={legendData.min}
                  max={legendData.max}
                  units={legendData.units}
                />
              )}
            </div>
          </section>

          {/* Placeholder for additional maps */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Canadian Provinces - Coming Soon
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Additional geospatial visualizations will be available here.
              </p>
            </div>
            <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-500">More maps coming soon</p>
            </div>
          </section>
        </div>

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            About This Dashboard
          </h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            This geospatial dashboard provides interactive choropleth maps powered by Leaflet and OpenStreetMap.
            Click on regions to view detailed information. Data is sourced from our economic time-series database
            and refreshed regularly.
          </p>
        </div>
      </div>
    </div>
  );
}
