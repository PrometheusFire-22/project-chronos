// apps/web/components/analytics/GeospatialMap.tsx
// Geospatial choropleth map component using Leaflet
// Architected for future migration to deck.gl with abstracted data fetching and common interface

'use client';

import { useEffect, useState } from 'react';
import type { ChoroplethFeatureCollection, Geography, Level } from '@/lib/types/geospatial';

// Common interface that will work with both Leaflet and deck.gl
export interface GeospatialMapProps {
  geography: Geography;
  level: Level;
  seriesId: string;
  date?: string;
  height?: string;
  onFeatureClick?: (featureId: string, featureName: string) => void;
  colorScale?: string[];
  onDataLoad?: (data: { min: number; max: number; units: string; seriesName: string }) => void;
}

// Abstracted data fetching hook - can be replaced for deck.gl
function useChoroplethData(
  geography: Geography,
  level: Level,
  seriesId: string,
  date?: string
) {
  const [data, setData] = useState<ChoroplethFeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          geography,
          level,
          seriesId,
        });

        if (date) {
          params.append('date', date);
        }

        const response = await fetch(`/api/geospatial/choropleth?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch choropleth data: ${response.statusText}`);
        }

        const featureCollection = await response.json();
        setData(featureCollection);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [geography, level, seriesId, date]);

  return { data, loading, error };
}

// Leaflet-specific implementation (will be replaced with deck.gl in Phase 2)
function LeafletChoroplethMap({
  data,
  height = '600px',
  onFeatureClick,
  colorScale = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
}: {
  data: ChoroplethFeatureCollection;
  height?: string;
  onFeatureClick?: (featureId: string, featureName: string) => void;
  colorScale?: string[];
}) {
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    // Dynamic import of Leaflet (required for SSR compatibility)
    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default icon paths for Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // North America bounds: [south-west, north-east]
      // Approximate bounds covering USA and Canada
      const northAmericaBounds: [[number, number], [number, number]] = [
        [24, -168], // Southwest corner (southern Alaska, west coast)
        [72, -52],  // Northeast corner (northern Canada, east coast)
      ];

      const mapInstance = L.map('geospatial-map', {
        zoomControl: true,
        attributionControl: false, // We'll add custom attribution
      }).fitBounds(northAmericaBounds);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapInstance);

      // Add minimal custom attribution in bottom right
      const attributionControl = L.control.attribution({
        position: 'bottomright',
        prefix: false, // Remove "Leaflet" prefix
      });
      attributionControl.addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>');
      attributionControl.addTo(mapInstance);

      setMap(mapInstance);

      return () => {
        mapInstance.remove();
      };
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!map || !data) return;

    const L = require('leaflet');

    // Calculate color scale based on data values
    const values = data.features
      .map(f => f.properties.value)
      .filter(v => v !== null && v !== undefined);

    const min = Math.min(...values);
    const max = Math.max(...values);

    const getColor = (value: number | null | undefined): string => {
      if (value === null || value === undefined) return '#cccccc';

      const normalized = (value - min) / (max - min);
      const index = Math.floor(normalized * (colorScale.length - 1));
      return colorScale[Math.max(0, Math.min(index, colorScale.length - 1))];
    };

    // Add GeoJSON layer
    const geoJsonLayer = L.geoJSON(data, {
      style: (feature: any) => ({
        fillColor: getColor(feature.properties.value),
        weight: 1,
        opacity: 1,
        color: '#666',
        fillOpacity: 0.7,
      }),
      onEachFeature: (feature: any, layer: any) => {
        const props = feature.properties;

        layer.bindPopup(`
          <strong>${props.name}</strong><br/>
          Value: ${props.value !== null ? props.value.toLocaleString() : 'N/A'}<br/>
          Series: ${props.seriesName}<br/>
          Date: ${props.date}
        `);

        layer.on('click', () => {
          if (onFeatureClick) {
            onFeatureClick(feature.id, props.name);
          }
        });
      },
    }).addTo(map);

    // Fit map to bounds
    map.fitBounds(geoJsonLayer.getBounds());

    return () => {
      map.removeLayer(geoJsonLayer);
    };
  }, [map, data, onFeatureClick, colorScale]);

  return (
    <div
      id="geospatial-map"
      style={{ height, width: '100%' }}
      className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
    />
  );
}

// Main component with loading states
export default function GeospatialMap({
  geography,
  level,
  seriesId,
  date,
  height = '600px',
  onFeatureClick,
  colorScale,
  onDataLoad,
}: GeospatialMapProps) {
  const { data, loading, error } = useChoroplethData(geography, level, seriesId, date);

  // Call onDataLoad when data changes
  useEffect(() => {
    if (data && onDataLoad) {
      const values = data.features
        .map(f => f.properties.value)
        .filter(v => v !== null && v !== undefined);

      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const firstFeature = data.features[0];

        onDataLoad({
          min,
          max,
          units: firstFeature?.properties.units || '',
          seriesName: firstFeature?.properties.seriesName || '',
        });
      }
    }
  }, [data, onDataLoad]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800"
        style={{ height }}
      >
        <div className="text-center p-6">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Error loading map</p>
          <p className="text-red-500 dark:text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <LeafletChoroplethMap
      data={data}
      height={height}
      onFeatureClick={onFeatureClick}
      colorScale={colorScale}
    />
  );
}
