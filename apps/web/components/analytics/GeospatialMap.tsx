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
  category: string;
  date?: string;
  height?: string;
  onFeatureClick?: (featureId: string, featureName: string) => void;
  colorScale?: string[];
  onDataLoad?: (data: { min: number; max: number; units: string; seriesName: string }) => void;
}

// Abstracted data fetching hook - can be replaced for deck.gl
const PROVINCE_TO_PRUID: Record<string, string> = {
  'Newfoundland and Labrador': '10',
  'Prince Edward Island': '11',
  'Nova Scotia': '12',
  'New Brunswick': '13',
  'Quebec': '24',
  'Ontario': '35',
  'Manitoba': '46',
  'Saskatchewan': '47',
  'Alberta': '48',
  'British Columbia': '59',
  'Yukon': '60',
  'Northwest Territories': '61',
  'Nunavut': '62',
};

function useChoroplethData(
  geography: Geography,
  level: Level,
  category: string,
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

        // 1. Fetch Static Geometry
        let geoUrl = '';
        if (geography === 'US') {
          geoUrl = '/geo/us-states.json';
        } else if (geography === 'CANADA') {
          geoUrl = '/geo/canada.json';
        } else {
          throw new Error(`Unsupported geography: ${geography}`);
        }

        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) throw new Error(`Failed to load geometry: ${geoResponse.statusText}`);
        const boundaryData = await geoResponse.json();

        // 2. Fetch Economic Data
        const dataParams = new URLSearchParams({ geography, category });
        if (date) dataParams.append('date', date);

        const dataResponse = await fetch(`/api/geospatial/choropleth?${dataParams}`);
        let dataValues: Record<string, number | null> = {};

        if (dataResponse.ok) {
          dataValues = await dataResponse.json();
        } else {
          console.warn('Failed to fetch data, displaying map only.');
        }

        // 3. Join Data with Geometry
        const features = boundaryData.features.map((feature: any) => {
          let id = feature.id; // US: FIPS code

          // Handle Canada ID Mapping
          if (geography === 'CANADA') {
            const name = feature.properties?.name;
            if (name && PROVINCE_TO_PRUID[name]) {
              id = PROVINCE_TO_PRUID[name];
            }
          }

          // Ensure ID is string for lookup
          const lookupId = id ? String(id).padStart(2, '0') : '';

          const rawValue = dataValues[lookupId];
          const value = (rawValue !== null && rawValue !== undefined && typeof rawValue === 'number' && !isNaN(rawValue))
            ? rawValue
            : null;

          return {
            ...feature,
            id: lookupId, // Standardize ID in feature
            properties: {
              ...feature.properties,
              value,
              geography,
              level,
              category,
              name: feature.properties.name || 'Unknown',
              seriesName: category === 'Employment' ? 'Unemployment Rate' : 'House Price Index',
              units: category === 'Employment' ? 'Percent' : 'Index',
              date: date || new Date().toISOString().split('T')[0],
            },
          };
        });

        setData({
          type: 'FeatureCollection',
          features,
        });

      } catch (err) {
        console.error("Map Data Error:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [geography, level, category, date]);

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
        attributionControl: false, // Completely remove attribution
        center: [50, -100], // Center on North America
        zoom: 4, // Better initial zoom
      }).fitBounds(northAmericaBounds);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '', // Remove attribution text
      }).addTo(mapInstance);

      setMap(mapInstance);

      return () => {
        mapInstance.remove();
      };
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!map || !data || data.features.length === 0) return;

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

        // Bind popup for click
        layer.bindPopup(`
          <strong>${props.name}</strong><br/>
          Value: ${(props.value !== null && typeof props.value === 'number' && !isNaN(props.value)) ? props.value.toLocaleString() : 'N/A'}<br/>
          Series: ${props.seriesName}<br/>
          Date: ${props.date}
        `);

        // Add tooltip for hover
        // Format concisely: "3.2%" instead of "3.2 Percent"
        const formattedValue = (props.value !== null && typeof props.value === 'number' && !isNaN(props.value)) ? props.value.toFixed(1) : 'N/A';
        const units = props.units === 'Percent' ? '%' : props.units;
        const tooltipContent = `<strong>${props.name}</strong><br/>${formattedValue}${units}`;
        layer.bindTooltip(tooltipContent, {
          sticky: true, // Tooltip follows mouse
          className: 'choropleth-tooltip',
        });

        // Hover effects
        layer.on('mouseover', function (this: any) {
          this.setStyle({
            weight: 2,
            color: '#333',
            fillOpacity: 0.9,
          });
        });

        layer.on('mouseout', function (this: any) {
          geoJsonLayer.resetStyle(this);
        });

        // Click handler
        layer.on('click', () => {
          if (onFeatureClick) {
            onFeatureClick(feature.id, props.name);
          }
        });
      },
    }).addTo(map);

    // Fit map to bounds with padding for better zoom
    const bounds = geoJsonLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 5, // Prevent zooming in too close
      });
    }

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
  category,
  date,
  height = '600px',
  onFeatureClick,
  colorScale,
  onDataLoad,
}: GeospatialMapProps) {
  const { data, loading, error } = useChoroplethData(geography, level, category, date);

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
