'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { scaleQuantile } from 'd3-scale';
import { Card } from '@chronos/ui/components/card';
import { Loader2 } from 'lucide-react';
import { getMetricConfig, formatMetricValue } from '@/lib/metrics/config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.automatonicai.com';

interface GeospatialMapLibreProps {
  metric?: string;
  date?: string;
}

interface RegionData {
  name: string;
  country: string;
  value: number | null;
  units?: string;
  metric?: string;
  date?: string;
}

interface Stats {
  min: number;
  max: number;
  cappedMax: number; // Max value after z-score outlier capping
  mean: number;
  stdDev: number;
  outlierThreshold: number; // The z-score threshold used (2.5σ)
  hasOutliers: boolean;
  usMin?: number;
  usMax?: number;
  caMin?: number;
  caMax?: number;
}

export default function GeospatialMapLibre({
  metric = 'unemployment',
  date
}: GeospatialMapLibreProps) {
  console.log('🔄 [COMPONENT] GeospatialMapLibre rendering with metric:', metric);

  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);
  const mapReady = useRef(false);

  // State
  const [loading, setLoading] = useState(true);
  const [dataEffectTrigger, setDataEffectTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [boundariesData, setBoundariesData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);


  // Compute color scale with z-score based capping
  const colorScale = useMemo(() => {
    if (!stats) return null;

    const isHPI = metric.toLowerCase().includes('house') || metric.toLowerCase().includes('hpi');
    const effectiveMax = stats.cappedMax;

    if (isHPI) {
      // Blues for HPI
      return scaleQuantile<string>()
        .domain([stats.min, effectiveMax])
        .range([
          '#eff6ff', // Very light blue
          '#bfdbfe', // Light blue
          '#60a5fa', // Medium blue
          '#2563eb', // Dark blue
          '#1e40af', // Deeper blue
          '#1e3a8a'  // Darkest blue
        ]);
    } else {
      // Yellow-Orange-Red for unemployment
      return scaleQuantile<string>()
        .domain([stats.min, effectiveMax])
        .range([
          '#fef3c7', // Very light yellow
          '#fcd34d', // Light yellow
          '#fb923c', // Orange
          '#f97316', // Dark orange
          '#dc2626', // Red
          '#991b1b'  // Dark red
        ]);
    }
  }, [stats, metric]);

  // Get color for value with z-score based outlier capping
  const getColorForValue = useMemo(() => {
    return (value: number | null, country: string): string => {
      if (value === null || !colorScale || !stats) return 'transparent';

      const isHPI = metric.toLowerCase().includes('house') || metric.toLowerCase().includes('hpi');

      if (isHPI) {
        // Use country-specific scales for HPI
        if (country === 'US' && stats.usMin !== undefined && stats.usMax !== undefined) {
          const usScale = scaleQuantile<string>()
            .domain([stats.usMin, stats.usMax])
            .range([
              '#eff6ff', '#bfdbfe', '#60a5fa',
              '#2563eb', '#1e40af', '#1e3a8a'
            ]);
          return usScale(value);
        } else if (country === 'CA' && stats.caMin !== undefined && stats.caMax !== undefined) {
          const caScale = scaleQuantile<string>()
            .domain([stats.caMin, stats.caMax])
            .range([
              '#eff6ff', '#bfdbfe', '#60a5fa',
              '#2563eb', '#1e40af', '#1e3a8a'
            ]);
          return caScale(value);
        }
      }

      // Apply z-score based capping for coloring only
      const Z_THRESHOLD = 2.5;
      const zScore = (value - stats.mean) / stats.stdDev;
      let cappedValue = value;

      if (Math.abs(zScore) > Z_THRESHOLD) {
        cappedValue = value > stats.mean
          ? stats.outlierThreshold
          : stats.mean - (Z_THRESHOLD * stats.stdDev);
      }

      return colorScale(cappedValue);
    };
  }, [colorScale, stats, metric]);

  // Initialize map
  useEffect(() => {
    console.log('🏗️ [MAP INIT EFFECT] Triggered!', {
      hasContainer: !!mapContainer.current,
      hasMap: !!map.current
    });

    if (!mapContainer.current || map.current) {
      console.log('⏭️ [MAP INIT EFFECT] Skipping - container or map issue', {
        hasContainer: !!mapContainer.current,
        hasMap: !!map.current
      });
      return;
    }

    const addDebug = (msg: string) => {
      console.log(msg);
      setDebugInfo(prev => [...prev, msg]);
    };

    try {
      addDebug('[MapLibre] Initializing map...');

      // Check WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        throw new Error('WebGL is not supported in this browser');
      }
      addDebug('[MapLibre] WebGL is supported ✓');

      // Check container dimensions
      const containerRect = mapContainer.current.getBoundingClientRect();
      addDebug(`[MapLibre] Container dimensions: ${containerRect.width}x${containerRect.height}`);

      if (containerRect.height === 0 || containerRect.width === 0) {
        throw new Error('Map container has zero dimensions');
      }

      // Create map with simple dark background (no basemap tiles for now)
      addDebug('[MapLibre] Creating map instance...');
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: {
                'background-color': '#0f172a' // Dark slate background
              }
            }
          ]
        },
        center: [-95, 48],
        zoom: 4.5,
        minZoom: 2.5,
        maxZoom: 8,
        maxBounds: [[-170, 15], [-50, 80]] // Constrain to North America
      });
      addDebug('[MapLibre] Map instance created ✓');

      // Create popup instance
      popup.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'maplibre-popup-custom'
      });

      // Setup map event handlers
      map.current.on('load', () => {
        console.log('🎉 [MAP INIT] Load event fired!');
        addDebug('[MapLibre] Map loaded successfully ✓');
        console.log('🔧 [MAP INIT] Setting mapReady.current = true and triggering data effect...');
        mapReady.current = true;
        setDataEffectTrigger(prev => prev + 1); // Trigger data effect to run
        console.log('✅ [MAP INIT] mapReady set and data effect triggered');
      });

      map.current.on('error', (e) => {
        const errorMsg = `Map error: ${e.error?.message || 'Unknown error'}`;
        console.error('[MapLibre]', errorMsg, e);
        addDebug(`[MapLibre] ❌ ${errorMsg}`);
        setError(errorMsg);
        setLoading(false);
      });

      // Listen for tile loading events
      map.current.on('sourcedataloading', (e) => {
        console.log('[MapLibre] Source data loading:', e.sourceId);
      });

      map.current.on('sourcedata', (e) => {
        if (e.isSourceLoaded) {
          console.log('[MapLibre] Source loaded:', e.sourceId);
        }
      });

      map.current.on('styleimagemissing', (e) => {
        console.warn('[MapLibre] Style image missing:', e.id);
      });

      addDebug('[MapLibre] Setup complete, waiting for load event...');

      // Cleanup
      return () => {
        console.log('🧹 [MAP INIT EFFECT] Cleanup running - removing map');
        map.current?.remove();
        map.current = null;
      };
    } catch (err) {
      const errorMsg = `Failed to initialize: ${err instanceof Error ? err.message : String(err)}`;
      console.error('[MapLibre]', errorMsg, err);
      addDebug(`[MapLibre] ❌ ${errorMsg}`);
      setError(errorMsg);
      setLoading(false);
    }
  }, []);

  // Load and update data
  useEffect(() => {
    console.log('🔍 [DATA EFFECT] Triggered!', { hasMap: !!map.current, mapReady: mapReady.current, metric });

    if (!map.current || !mapReady.current) {
      console.warn('⏸️ [DATA EFFECT] Waiting for map to be ready...', { hasMap: !!map.current, mapReady: mapReady.current });
      return;
    }

    console.log('🚀 [DATA EFFECT] Map is ready, starting loadData()...');

    const loadData = async () => {
      try {
        console.log('📊 [DATA LOAD] Starting data load for metric:', metric);
        setLoading(true);
        setError(null);

        const normalizedMetric = metric.toLowerCase();
        console.log('📡 [DATA LOAD] Fetching from API:', API_BASE_URL);

        // Fetch boundaries and data in parallel
        const [boundariesRes, dataRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/geo/choropleth?metric=${encodeURIComponent(normalizedMetric)}&mode=boundaries`),
          fetch(`${API_BASE_URL}/api/geo/choropleth?metric=${encodeURIComponent(normalizedMetric)}&mode=data`)
        ]);

        console.log('✅ [DATA LOAD] API responses received', {
          boundariesOk: boundariesRes.ok,
          dataOk: dataRes.ok
        });

        if (!boundariesRes.ok) throw new Error('Failed to load boundaries');
        if (!dataRes.ok) throw new Error('Failed to load metric data');

        const boundaries = await boundariesRes.json();
        const dataResponse = await dataRes.json();
        const dataPoints: RegionData[] = dataResponse.data || [];

        console.log('✅ [DATA LOAD] Data parsed:', {
          boundaryFeatures: boundaries.features?.length,
          dataPoints: dataPoints.length
        });

        // Calculate statistics with z-score based outlier detection
        const values: number[] = [];
        const usValues: number[] = [];
        const caValues: number[] = [];

        dataPoints.forEach(d => {
          const val = d.value;
          if (val !== null && !isNaN(val)) {
            values.push(val);
            if (d.country === 'US') usValues.push(val);
            else if (d.country === 'CA') caValues.push(val);
          }
        });

        if (values.length === 0) {
          throw new Error('No valid data points');
        }

        // Calculate mean and standard deviation
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        // Z-score threshold: 2.5 standard deviations
        const Z_THRESHOLD = 2.5;
        const outlierThreshold = mean + (Z_THRESHOLD * stdDev);

        // Identify outliers and calculate capped max
        const cappedValues = values.map(val => {
          const zScore = Math.abs((val - mean) / stdDev);
          if (zScore > Z_THRESHOLD) {
            // Cap extreme outliers at the threshold
            return val > mean ? outlierThreshold : mean - (Z_THRESHOLD * stdDev);
          }
          return val;
        });

        const sortedValues = [...values].sort((a, b) => a - b);
        const hasOutliers = sortedValues[sortedValues.length - 1] > outlierThreshold;

        const calculatedStats = {
          min: sortedValues[0] || 0,
          max: sortedValues[sortedValues.length - 1] || 10,
          cappedMax: Math.max(...cappedValues),
          mean,
          stdDev,
          outlierThreshold,
          hasOutliers,
          usMin: usValues.length > 0 ? Math.min(...usValues) : undefined,
          usMax: usValues.length > 0 ? Math.max(...usValues) : undefined,
          caMin: caValues.length > 0 ? Math.min(...caValues) : undefined,
          caMax: caValues.length > 0 ? Math.max(...caValues) : undefined
        };

        console.log('📊 [DATA LOAD] Stats calculated:', calculatedStats);
        console.log('💾 [DATA LOAD] Calling setStats()...');
        setStats(calculatedStats);
        console.log('✅ [DATA LOAD] setStats() completed');

        // Merge data into boundaries
        const dataMap = new Map(dataPoints.map(d => [d.name, d]));

        boundaries.features = boundaries.features.map((feature: any) => {
          const regionName = feature.properties.name;
          const data = dataMap.get(regionName);

          return {
            ...feature,
            properties: {
              ...feature.properties,
              value: data?.value ?? null,
              units: data?.units,
              metric: data?.metric || normalizedMetric,
              date: data?.date
            }
          };
        });

        // Store boundaries in state for later color updates
        console.log('💾 [DATA LOAD] Storing boundaries data...');
        setBoundariesData(boundaries);

        console.log('🗺️ [DATA LOAD] Adding layers to map...');

        // Remove existing source and layers if they exist
        if (map.current!.getLayer('regions-fill')) {
          console.log('[MapLibre] Removing existing regions-fill layer');
          map.current!.removeLayer('regions-fill');
        }
        if (map.current!.getLayer('regions-line')) {
          console.log('[MapLibre] Removing existing regions-line layer');
          map.current!.removeLayer('regions-line');
        }
        if (map.current!.getSource('regions')) {
          console.log('[MapLibre] Removing existing regions source');
          map.current!.removeSource('regions');
        }

        // Add source
        console.log('[MapLibre] Adding regions source with', boundaries.features.length, 'features');
        map.current!.addSource('regions', {
          type: 'geojson',
          data: boundaries
        });

        // Add fill layer (will be styled after stats are computed)
        map.current!.addLayer({
          id: 'regions-fill',
          type: 'fill',
          source: 'regions',
          paint: {
            'fill-color': 'transparent', // Will be updated below
            'fill-opacity': 0.8
          }
        });

        // Add border layer
        map.current!.addLayer({
          id: 'regions-line',
          type: 'line',
          source: 'regions',
          paint: {
            'line-color': '#0f172a',
            'line-width': 0.5
          }
        });

        // Setup hover interactions
        let hoveredFeatureId: string | number | undefined = undefined;

        map.current!.on('mousemove', 'regions-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;

            // Change cursor
            map.current!.getCanvas().style.cursor = 'pointer';

            // Update hover state
            if (hoveredFeatureId !== undefined) {
              map.current!.setFeatureState(
                { source: 'regions', id: hoveredFeatureId },
                { hover: false }
              );
            }
            hoveredFeatureId = feature.id;
            map.current!.setFeatureState(
              { source: 'regions', id: hoveredFeatureId },
              { hover: true }
            );

            // Show tooltip
            const config = getMetricConfig(props.metric || normalizedMetric);
            const displayValue = formatMetricValue(props.value, config);

            const tooltipHTML = `
              <div class="backdrop-blur-xl bg-slate-900/90 border border-white/10 rounded-lg p-2 shadow-2xl">
                <div class="text-sm font-bold text-white mb-1">${props.name}</div>
                <div class="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">${config.displayName}</div>
                <div class="flex items-center justify-between gap-2">
                  <div class="text-lg font-bold text-orange-400">${displayValue}</div>
                  <div class="flex items-center gap-0.5">
                    <svg class="w-1.5 h-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                    <span class="text-[7px] text-slate-500 uppercase tracking-wider font-semibold">${config.frequency}</span>
                  </div>
                </div>
              </div>
            `;

            popup.current!
              .setLngLat(e.lngLat)
              .setHTML(tooltipHTML)
              .addTo(map.current!);
          }
        });

        map.current!.on('mouseleave', 'regions-fill', () => {
          map.current!.getCanvas().style.cursor = '';

          if (hoveredFeatureId !== undefined) {
            map.current!.setFeatureState(
              { source: 'regions', id: hoveredFeatureId },
              { hover: false }
            );
          }
          hoveredFeatureId = undefined;

          popup.current!.remove();
        });

        console.log('🎉 [DATA LOAD] Data load complete, map should now be visible');

        // Force map to resize (fixes timing issues)
        map.current!.resize();
        console.log('📐 [DATA LOAD] Map resized');

        console.log('🏁 [DATA LOAD] Calling setLoading(false)...');
        setLoading(false);
        console.log('✅ [DATA LOAD] setLoading(false) completed');

      } catch (err: any) {
        console.error('❌ [DATA LOAD] Data load error:', err);
        console.error('❌ [DATA LOAD] Error stack:', err.stack);
        setError(err.message);
        setLoading(false);
      }
    };

    console.log('🔄 [DATA EFFECT] Calling loadData()...');
    loadData().then(() => {
      console.log('✅ [DATA EFFECT] loadData() promise resolved');
    }).catch((err) => {
      console.error('❌ [DATA EFFECT] loadData() promise rejected:', err);
    });
  }, [metric, date, dataEffectTrigger]);

  // Update colors when stats/scale changes
  useEffect(() => {
    if (!map.current || !map.current.getLayer('regions-fill') || !stats || !colorScale || !boundariesData) return;

    const source = map.current.getSource('regions') as maplibregl.GeoJSONSource;
    if (!source) return;

    // Pre-compute colors for each feature
    const updatedBoundaries = {
      ...boundariesData,
      features: boundariesData.features.map((feature: any, index: number) => {
        const value = feature.properties.value;
        const country = feature.properties.country;
        const color = getColorForValue(value, country);

        return {
          ...feature,
          id: index,
          properties: {
            ...feature.properties,
            color
          }
        };
      })
    };

    // Update the source with colored features
    source.setData(updatedBoundaries);

    // Update layer to use the pre-computed colors
    map.current.setPaintProperty('regions-fill', 'fill-color', [
      'get',
      'color'
    ]);

  }, [stats, colorScale, getColorForValue, boundariesData]);

  if (error) {
    return (
      <Card className="h-[600px] flex flex-col items-center justify-center bg-slate-900/50 border-red-500/20 p-8">
        <div className="text-red-400 text-lg font-bold mb-4">Failed to load map</div>
        <div className="text-red-300 text-sm mb-6">{error}</div>
        {debugInfo.length > 0 && (
          <div className="text-xs text-slate-400 font-mono max-w-2xl">
            <div className="font-bold mb-2">Debug Info:</div>
            {debugInfo.map((msg, i) => (
              <div key={i} className="mb-1">{msg}</div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  const isHPI = metric.toLowerCase().includes('house') || metric.toLowerCase().includes('hpi');
  const gradientClass = isHPI
    ? 'bg-gradient-to-r from-blue-50 via-blue-400 to-blue-900'
    : 'bg-gradient-to-r from-yellow-100 via-orange-400 to-red-900';

  return (
    <Card className="h-[600px] w-full overflow-hidden relative border-0 ring-1 ring-white/10 shadow-2xl bg-slate-950">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-2" />
          <div className="text-sm text-slate-400">Loading geospatial data...</div>
          {debugInfo.length > 0 && (
            <div className="mt-4 text-xs text-green-400 font-mono max-w-md">
              {debugInfo.map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {stats && (
        <div className="absolute bottom-6 right-6 z-[500] bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-2xl flex flex-col gap-1 w-48">
          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>Low</span>
            <span>High</span>
          </div>
          <div className={`h-2 w-full rounded-full ${gradientClass}`} />
          <div className="flex justify-between text-xs text-white font-mono mt-1">
            <span>{stats.min.toFixed(1)}</span>
            <span>{stats.cappedMax.toFixed(1)}</span>
          </div>
          {stats.hasOutliers && (
            <div className="text-[8px] text-orange-400 text-center mt-0.5">
              ⚠ Extreme outliers capped at 2.5σ (max: {stats.max.toFixed(1)})
            </div>
          )}
          <div className="text-[9px] text-slate-500 text-center mt-1 uppercase tracking-widest">
            {metric}
          </div>
          {(stats.usMax !== undefined && stats.caMax !== undefined) && (
            <div className="text-[7px] text-slate-600 text-center mt-1 border-t border-slate-700 pt-1">
              US: {stats.usMin?.toFixed(0)}-{stats.usMax?.toFixed(0)} | CA: {stats.caMin?.toFixed(0)}-{stats.caMax?.toFixed(0)}
            </div>
          )}
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ background: '#020617' }}
      />

      {/* Add custom CSS for popup */}
      <style jsx global>{`
        .maplibre-popup-custom .maplibre-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .maplibre-popup-custom .maplibre-popup-tip {
          display: none !important;
        }
      `}</style>
    </Card>
  );
}
