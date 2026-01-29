'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import type { PMTiles } from 'pmtiles';
import polylabel from '@mapbox/polylabel';
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
  // Popups are created on-demand for each click (allows multiple comparison tooltips)
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
      // Show regions without data in a light gray instead of transparent
      if (value === null || !colorScale || !stats) return '#1e293b'; // slate-800

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

      // Using Stadia Maps (Stamen) - FREE vector tiles with proper layer control
      // This lets us put water ABOVE the choropleth so Great Lakes are visible
      addDebug('[MapLibre] Creating map instance with Stadia Maps...');

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.stadiamaps.com/styles/stamen_toner_background.json',
        center: [-95, 48],
        zoom: 4.5,
        minZoom: 2.5,
        maxZoom: 8,
        maxBounds: [[-170, 15], [-50, 80]],
        attributionControl: false // Remove attribution control
      });
      addDebug('[MapLibre] Map instance created ✓');

      // Popup will be created on-demand for each click (allows multiple popups)

      // Setup map event handlers
      map.current.on('load', () => {
        console.log('🎉 [MAP INIT] Load event fired!');
        addDebug('[MapLibre] Map loaded successfully ✓');

        // Log all available layers for debugging
        const layers = map.current!.getStyle().layers;
        console.log('🗺️ [MAP INIT] Available basemap layers:', layers.map((l: any) => l.id));

        console.log('🔧 [MAP INIT] Scheduling data load with setTimeout...');
        // Add small delay to ensure React state has fully initialized
        setTimeout(() => {
          console.log('⏰ [MAP INIT] Timeout fired, triggering data load...');
          mapReady.current = true;
          setDataEffectTrigger(prev => prev + 1);
          console.log('✅ [MAP INIT] Data effect triggered');
        }, 500);
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
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
        mapReady.current = false;
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

        // Log data distribution by country
        const countryCount = dataPoints.reduce((acc, d) => {
          acc[d.country] = (acc[d.country] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('📊 [DATA LOAD] Data by country:', countryCount);

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

        // Log boundaries by country
        const boundariesByCountry = boundaries.features.reduce((acc: Record<string, number>, f: any) => {
          const country = f.properties.country || 'unknown';
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {});
        console.log('🗺️ [DATA LOAD] Boundaries by country:', boundariesByCountry);

        // Log features with and without data
        const featuresWithData = boundaries.features.filter((f: any) => f.properties.value !== null).length;
        console.log('📊 [DATA LOAD] Features with data:', featuresWithData, '/', boundaries.features.length);

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

        // Add IDs to features (required for setFeatureState in hover interactions)
        const boundariesWithIds = {
          ...boundaries,
          features: boundaries.features.map((feature: any, index: number) => ({
            ...feature,
            id: index
          }))
        };

        // Add source
        console.log('[MapLibre] Adding regions source with', boundariesWithIds.features.length, 'features');
        map.current!.addSource('regions', {
          type: 'geojson',
          data: boundariesWithIds,
          generateId: false // Use our explicit IDs
        });

        // Create deduplicated centroids using polylabel (pole of inaccessibility)
        // This gives the best visual center for complex shapes like Michigan
        const labelCentroids: { [key: string]: { name: string; coords: [number, number]; value: any } } = {};

        boundariesWithIds.features.forEach((feature: any) => {
          const name = feature.properties.name;
          if (!labelCentroids[name]) {
            let bestCenter: [number, number] | null = null;

            try {
              if (feature.geometry.type === 'Polygon') {
                // Use polylabel to find the pole of inaccessibility
                bestCenter = polylabel(feature.geometry.coordinates, 1.0);
              } else if (feature.geometry.type === 'MultiPolygon') {
                // For MultiPolygon, find the largest polygon and use its pole
                let largestPolygon = feature.geometry.coordinates[0];
                let largestArea = 0;

                feature.geometry.coordinates.forEach((polygon: any) => {
                  // Simple area approximation
                  const area = polygon[0].length;
                  if (area > largestArea) {
                    largestArea = area;
                    largestPolygon = polygon;
                  }
                });

                bestCenter = polylabel(largestPolygon, 1.0);
              }

              if (bestCenter) {
                labelCentroids[name] = {
                  name,
                  coords: bestCenter,
                  value: feature.properties.value
                };
              }
            } catch (e) {
              console.warn('[MapLibre] Could not calculate polylabel for', name, e);
            }
          }
        });

        // Create GeoJSON for label centroids
        const labelFeatures = Object.values(labelCentroids).map((centroid, index) => ({
          type: 'Feature',
          id: index,
          geometry: {
            type: 'Point',
            coordinates: centroid.coords
          },
          properties: {
            name: centroid.name,
            value: centroid.value
          }
        }));

        console.log('[MapLibre] Created', labelFeatures.length, 'deduplicated label centroids');

        // Add label source
        map.current!.addSource('regions-labels', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: labelFeatures
          }
        });

        // Add fill layer (colors will be set by color update effect)
        // Lower opacity (0.65) so placenames below are more readable
        console.log('[MapLibre] Adding fill layer');
        map.current!.addLayer({
          id: 'regions-fill',
          type: 'fill',
          source: 'regions',
          paint: {
            'fill-color': 'transparent', // Will be updated by color effect
            'fill-opacity': 0.65 // Reduced from 0.8 for better label visibility
          }
        });
        console.log('[MapLibre] Fill layer added successfully');

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

        // Add STATE/PROVINCE NAME LABELS from deduplicated polylabel centroids
        console.log('[MapLibre] Adding state/province name labels with polylabel placement');
        map.current!.addLayer({
          id: 'regions-labels-layer',
          type: 'symbol',
          source: 'regions-labels', // Use the polylabel centroids source
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 10, // Smaller, more demure
            'text-transform': 'uppercase',
            'text-letter-spacing': 0.05,
            'text-max-width': 8,
            'text-allow-overlap': false // Don't overlap labels
          },
          paint: {
            'text-color': '#94a3b8', // Subtle slate-400 for better readability
            'text-opacity': 0.8 // Sharp, no halo for crisp rendering
          }
        });
        console.log('[MapLibre] State/province labels added');

        // CRITICAL: Add water layer ON TOP to show Great Lakes properly
        // The state boundaries extend over water (administrative boundaries),
        // so we need to render water above the choropleth
        console.log('[MapLibre] Adding water overlay layer to show Great Lakes');

        // Check if basemap has water layers we can move on top
        const style = map.current!.getStyle();
        const waterLayers = style.layers.filter((l: any) =>
          l.id && (l.id.includes('water') || l.id.includes('ocean') || l.id.includes('lake') || l.id.includes('river'))
        );

        console.log('[MapLibre] Found water layers:', waterLayers.map((l: any) => l.id));

        // Move all water layers above the choropleth
        waterLayers.forEach((layer: any) => {
          try {
            map.current!.moveLayer(layer.id);
            console.log('[MapLibre] Moved water layer to top:', layer.id);
          } catch (e) {
            console.log('[MapLibre] Could not move layer:', layer.id, e);
          }
        });

        // Move place name/label layers to the very top so they're readable
        const labelLayers = style.layers.filter((l: any) =>
          l.id && (
            l.id.includes('label') ||
            l.id.includes('place') ||
            l.id.includes('text') ||
            l.id.includes('city') ||
            l.id.includes('state') ||
            l.type === 'symbol'
          )
        );

        console.log('[MapLibre] Found label layers:', labelLayers.map((l: any) => l.id));

        // Move all label layers to absolute top
        labelLayers.forEach((layer: any) => {
          try {
            map.current!.moveLayer(layer.id);
            console.log('[MapLibre] Moved label layer to top:', layer.id);
          } catch (e) {
            console.log('[MapLibre] Could not move label layer:', layer.id, e);
          }
        });

        // CRITICAL: Move our custom state/province labels to the VERY TOP
        if (map.current!.getLayer('regions-labels-layer')) {
          try {
            map.current!.moveLayer('regions-labels-layer');
            console.log('[MapLibre] Moved regions-labels-layer to absolute top');
          } catch (e) {
            console.log('[MapLibre] Could not move regions-labels-layer:', e);
          }
        }

        // Setup click interactions for pinned tooltips
        let hoveredFeatureId: string | number | undefined = undefined;

        // Hover effect - just change cursor
        map.current!.on('mousemove', 'regions-fill', (e) => {
          map.current!.getCanvas().style.cursor = 'pointer';

          if (e.features && e.features.length > 0) {
            const feature = e.features[0];

            // Update hover state
            if (hoveredFeatureId !== undefined && hoveredFeatureId !== feature.id) {
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
        });

        // Click to create pinned tooltip (allows multiple tooltips for comparison)
        map.current!.on('click', 'regions-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;

            const config = getMetricConfig(props.metric || normalizedMetric);
            const displayValue = formatMetricValue(props.value, config);

            const tooltipHTML = `
              <div class="bg-slate-900/95 border border-white/10 rounded-lg p-3 shadow-2xl">
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

            // Create new popup for each click (allows multiple popups)
            new maplibregl.Popup({
              closeButton: true,
              closeOnClick: false,
              className: 'maplibre-popup-custom'
            })
              .setLngLat(e.lngLat)
              .setHTML(tooltipHTML)
              .addTo(map.current!);
          }
        });

        console.log('🎉 [DATA LOAD] Data load complete, map should now be visible');

        // Force map to resize (fixes timing issues) - use setTimeout to ensure DOM is ready
        setTimeout(() => {
          if (map.current) {
            map.current.resize();
            console.log('📐 [DATA LOAD] Map resized');
          }
        }, 100);

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
    console.log('🎨 [COLOR UPDATE] Effect triggered!', {
      hasMap: !!map.current,
      hasLayer: map.current ? !!map.current.getLayer('regions-fill') : false,
      hasStats: !!stats,
      hasColorScale: !!colorScale,
      hasBoundariesData: !!boundariesData
    });

    if (!map.current || !map.current.getLayer('regions-fill') || !stats || !colorScale || !boundariesData) {
      console.log('⏸️ [COLOR UPDATE] Skipping - missing dependencies');
      return;
    }

    const source = map.current.getSource('regions') as maplibregl.GeoJSONSource;
    if (!source) return;

    // Pre-compute colors for each feature
    const updatedBoundaries = {
      ...boundariesData,
      features: boundariesData.features.map((feature: any, index: number) => {
        const value = feature.properties.value;
        const country = feature.properties.country;
        const color = getColorForValue(value, country);

        // Log first few colors to debug
        if (index < 5) {
          console.log(`🎨 [COLOR UPDATE] Feature ${index} (${feature.properties.name}):`, {
            value,
            country,
            color
          });
        }

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

    console.log('🎨 [COLOR UPDATE] Sample of computed colors:',
      updatedBoundaries.features.slice(0, 3).map((f: any) => ({
        name: f.properties.name,
        value: f.properties.value,
        color: f.properties.color
      }))
    );

    // Update the source with colored features
    console.log('🎨 [COLOR UPDATE] Updating source with colored features');
    source.setData(updatedBoundaries);

    // Update layer to use the pre-computed colors
    console.log('🎨 [COLOR UPDATE] Setting fill-color paint property');
    map.current.setPaintProperty('regions-fill', 'fill-color', [
      'get',
      'color'
    ]);
    console.log('✅ [COLOR UPDATE] Colors applied successfully!');

    // Add water layer ON TOP of choropleth to show Great Lakes
    // Check if the style has a water layer we can reference
    if (map.current.getStyle().layers) {
      const waterLayerExists = map.current.getStyle().layers.some((l: any) => l.id === 'water-overlay');

      if (!waterLayerExists) {
        console.log('🌊 [COLOR UPDATE] Adding water overlay layer on top');

        // Try to find the water layer from the basemap
        const basemapWaterLayer = map.current.getStyle().layers.find((l: any) =>
          l.id && (l.id.includes('water') || l.id.includes('ocean') || l.id.includes('lake'))
        );

        if (basemapWaterLayer) {
          console.log('🌊 [COLOR UPDATE] Found basemap water layer:', basemapWaterLayer.id);
          // The water layer should already be visible if it's from the basemap
          // Move it above the choropleth
          try {
            map.current.moveLayer(basemapWaterLayer.id, 'regions-line');
            console.log('🌊 [COLOR UPDATE] Moved water layer above choropleth');
          } catch (e) {
            console.log('🌊 [COLOR UPDATE] Could not move water layer:', e);
          }
        }
      }
    }

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
    <Card className="h-[600px] w-full overflow-hidden relative border-0 ring-1 ring-white/10 shadow-2xl bg-slate-950" style={{ position: 'relative', height: '600px' }}>
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
        className="absolute inset-0 z-0"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          background: '#020617'
        }}
      />

      {/* Add custom CSS for popup and hide attribution */}
      <style jsx global>{`
        /* Remove white outline but keep the blue card */
        .maplibregl-popup-content,
        .maplibregl-popup-content-wrapper,
        .maplibre-popup-custom .maplibre-popup-content,
        .maplibre-popup-custom .maplibre-popup-content-wrapper {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .maplibregl-popup-tip,
        .maplibre-popup-custom .maplibre-popup-tip {
          display: none !important;
        }

        /* Small, proportional close button */
        .maplibregl-popup-close-button,
        .maplibre-popup-custom .maplibre-popup-close-button {
          font-size: 16px !important;
          font-weight: normal !important;
          color: #94a3b8 !important;
          padding: 2px 6px !important;
          right: 4px !important;
          top: 4px !important;
          background: transparent !important;
          border-radius: 2px !important;
          line-height: 1 !important;
        }
        .maplibregl-popup-close-button:hover,
        .maplibre-popup-custom .maplibre-popup-close-button:hover {
          background-color: rgba(148, 163, 184, 0.2) !important;
          color: #e2e8f0 !important;
        }

        /* Hide MapLibre attribution */
        .maplibregl-ctrl-attrib,
        .maplibregl-ctrl-bottom-right {
          display: none !important;
        }
      `}</style>
    </Card>
  );
}
