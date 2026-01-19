'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { scaleQuantile, scaleSequential } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';
import 'leaflet/dist/leaflet.css';
import './tooltip.css';
import { Card } from '@chronos/ui/components/card';
import { Loader2 } from 'lucide-react';
import { getMetricConfig, formatMetricValue } from '@/lib/metrics/config';
// Fix Leaflet marker icons in Next.js
import L from 'leaflet';
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GeospatialMapProps {
    metric?: string;
    date?: string;
}

function MapController() {
  const map = useMap();
  useEffect(() => {
    // Invalidate size to ensure proper rendering after container resize
    map.invalidateSize();
  }, [map]);
  return null;
}

export default function GeospatialMap({ metric = 'Unemployment', date }: GeospatialMapProps) {
    const [geoData, setGeoData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

    // State for dynamic scaling with country separation
    const [stats, setStats] = useState<{
        min: number;
        max: number;
        p95: number;
        usMin?: number;
        usMax?: number;
        caMin?: number;
        caMax?: number;
    } | null>(null);

    // Color Scale (D3) - Quantile-based with outlier capping
    // Different color schemes for different metrics
    const colorScale = useMemo(() => {
        if (!stats) return null;

        // Use quantile scale for better distribution
        // Cap at 95th percentile to handle outliers (territories)
        const effectiveMax = stats.p95;

        // Metric-specific color palettes
        const isHPI = metric.toLowerCase().includes('house') || metric.toLowerCase().includes('hpi');

        if (isHPI) {
            // Blues palette for HPI (cooler, professional)
            return scaleQuantile<string>()
                .domain([stats.min, effectiveMax])
                .range([
                    '#eff6ff', // 0-20th percentile: Very light blue
                    '#bfdbfe', // 20-40th: Light blue
                    '#60a5fa', // 40-60th: Medium blue
                    '#2563eb', // 60-80th: Dark blue
                    '#1e40af', // 80-95th: Deeper blue
                    '#0a0a1a'  // 95-100th (outliers): Nearly black with blue tinge
                ]);
        } else {
            // Yellow-Orange-Red palette for unemployment (warmer, attention-grabbing)
            return scaleQuantile<string>()
                .domain([stats.min, effectiveMax])
                .range([
                    '#fef3c7', // 0-20th percentile: Very light yellow
                    '#fcd34d', // 20-40th: Light yellow
                    '#fb923c', // 40-60th: Orange
                    '#f97316', // 60-80th: Dark orange
                    '#dc2626', // 80-95th: Red
                    '#1a0000'  // 95-100th (outliers): Nearly black with red tinge
                ]);
        }
    }, [stats, metric]);

    // Country-specific color scales for HPI
    const getCountrySpecificScale = useMemo(() => {
        return (country: string) => {
            if (!stats) return null;

            // For HPI, use country-specific ranges
            if (metric.toLowerCase().includes('house') || metric.toLowerCase().includes('hpi')) {
                if (country === 'US' && stats.usMin !== undefined && stats.usMax !== undefined) {
                    return scaleQuantile<string>()
                        .domain([stats.usMin, stats.usMax])
                        .range([
                            '#eff6ff', // Very light blue
                            '#bfdbfe', // Light blue
                            '#60a5fa', // Medium blue
                            '#2563eb', // Dark blue
                            '#1e40af', // Deeper blue
                            '#0a0a1a'  // Nearly black with blue tinge
                        ]);
                } else if (country === 'CA' && stats.caMin !== undefined && stats.caMax !== undefined) {
                    return scaleQuantile<string>()
                        .domain([stats.caMin, stats.caMax])
                        .range([
                            '#eff6ff', // Very light blue
                            '#bfdbfe', // Light blue
                            '#60a5fa', // Medium blue
                            '#2563eb', // Dark blue
                            '#1e40af', // Deeper blue
                            '#0a0a1a'  // Nearly black with blue tinge
                        ]);
                }
            }
            return colorScale;
        };
    }, [stats, metric, colorScale]);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                setGeoData(null); // CRITICAL: Clear old data to force layer unmount

                // Normalize metric to lowercase for API consistency
                const normalizedMetric = metric.toLowerCase();

                // 1. Fetch Static Geometry from API
                const apiUrl = '/api-proxy';
                const geoRes = await fetch(`${apiUrl}/geo/choropleth?metric=${encodeURIComponent(normalizedMetric)}&mode=boundaries`);
                if (!geoRes.ok) throw new Error(`Failed to load map boundaries: ${geoRes.statusText}`);
                const geoJson = await geoRes.json();

                // 2. Fetch Live Economic Data
                const dataRes = await fetch(`${apiUrl}/geo/choropleth?metric=${encodeURIComponent(normalizedMetric)}&mode=data`);


                let combinedGeoJson = geoJson;
                let min = Infinity;
                let max = -Infinity;

                if (dataRes.ok) {
                   const apiResponse = await dataRes.json();
                   const dataPoints = apiResponse.data || [];

                   // Calculate Min/Max and percentiles for dynamic scaling
                   const values: number[] = [];
                   const usValues: number[] = [];
                   const caValues: number[] = [];

                   dataPoints.forEach((d: any) => {
                       const val = parseFloat(d.value);
                       if (!isNaN(val)) {
                           values.push(val);
                           if (val < min) min = val;
                           if (val > max) max = val;

                           // Separate by country for HPI
                           if (d.country === 'US') usValues.push(val);
                           else if (d.country === 'CA') caValues.push(val);
                       }
                   });

                   // Calculate 95th percentile for outlier capping
                   values.sort((a, b) => a - b);
                   const p95Index = Math.floor(values.length * 0.95);
                   const p95 = values[p95Index] || max;

                   // 3. Merge Data into Geometry
                   const mergedFeatures = geoJson.features.map((feature: any) => {
                        const regionName = feature.properties?.name;
                        const match = dataPoints.find((d: any) => d.name === regionName);

                        if (match) {
                            return {
                                ...feature,
                                properties: {
                                    ...feature.properties,
                                    ...match
                                }
                            };
                        }
                        return feature;
                   });
                   combinedGeoJson = { ...geoJson, features: mergedFeatures };

                   // Set stats with country-specific ranges
                   setStats({
                       min: min === Infinity ? 0 : min,
                       max: max === -Infinity ? 10 : max,
                       p95,
                       usMin: usValues.length > 0 ? Math.min(...usValues) : undefined,
                       usMax: usValues.length > 0 ? Math.max(...usValues) : undefined,
                       caMin: caValues.length > 0 ? Math.min(...caValues) : undefined,
                       caMax: caValues.length > 0 ? Math.max(...caValues) : undefined
                   });

                } else {
                    console.warn('Failed to fetch economic data');
                }

                setGeoData(combinedGeoJson);

            } catch (err: any) {
                console.error('Map Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [metric, date]);

    // Memoize style function to prevent unnecessary re-renders
    const style = useMemo(() => (feature: any) => {
        const val = feature.properties.value ? parseFloat(feature.properties.value) : null;
        const country = feature.properties.country;

        // Use country-specific scale for HPI, otherwise use default
        const scale = getCountrySpecificScale(country) || colorScale;

        return {
            fillColor: val !== null && scale ? scale(val) : 'transparent',
            weight: 0.5,
            opacity: 1,
            color: '#0f172a', // Slate-900 borders
            fillOpacity: 0.8
        };
    }, [colorScale, getCountrySpecificScale]);

    // Memoize onEachFeature to prevent event listener churn
    // Note: We use a callback ref pattern inside if interactions start lagging,
    // but for now simple memoization helps.
    const onEachFeature = useMemo(() => (feature: any, layer: any) => {
        if (feature.properties) {
            const props = feature.properties;
            const stateName = props.name || 'Unknown';
            const rawValue = props.value;
            const metricType = props.metric || metric.toLowerCase();

            // Get metric configuration from registry
            const config = getMetricConfig(metricType);
            const displayValue = formatMetricValue(rawValue, config);

            // Compact glassmorphic tooltip
            const tooltipContent = `
                <div class="backdrop-blur-xl bg-slate-900/90 border border-white/10 rounded-lg p-2 shadow-2xl">
                    <div class="text-sm font-bold text-white mb-1">${stateName}</div>
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

            // Bind tooltip (hover)
            layer.bindTooltip(tooltipContent, {
                sticky: true,
                className: 'leaflet-tooltip-custom',
                direction: 'top',
                opacity: 1,
                offset: [0, -10]
            });

            // Click to pin tooltip logic
            let popup: any = null;

            layer.on('click', function(e: any) {
                L.DomEvent.stopPropagation(e);

                if (popup) {
                    e.target._map.closePopup(popup);
                    popup = null;
                } else {
                    const popupDiv = document.createElement('div');
                    popupDiv.className = 'backdrop-blur-xl bg-slate-900/90 border border-white/10 rounded-lg p-2 shadow-2xl relative';

                    popupDiv.innerHTML = `
                        <div class="text-sm font-bold text-white mb-1 pr-4">${stateName}</div>
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
                    `;

                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'absolute top-1 right-1 text-slate-400 hover:text-white transition-colors z-10';
                    closeBtn.innerHTML = `
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    `;

                    popupDiv.insertBefore(closeBtn, popupDiv.firstChild);

                    popup = L.popup({
                        className: 'leaflet-popup-custom',
                        closeButton: false,
                        autoClose: false,
                        closeOnClick: false,
                        offset: [0, -10]
                    })
                    .setLatLng(e.latlng)
                    .setContent(popupDiv)
                    .openOn(e.target._map);

                    setTimeout(() => {
                        const btn = popupDiv.querySelector('button');
                        if (btn) {
                            btn.addEventListener('click', (evt) => {
                                evt.stopPropagation();
                                e.target._map.closePopup(popup);
                                popup = null;
                            });
                        }
                    }, 0);
                }
            });
        }
    }, [metric]);

    if (error) return (
        <Card className="h-[600px] flex items-center justify-center bg-slate-900/50 border-red-500/20">
            <div className="text-red-400">Failed to load map: {error}</div>
        </Card>
    );

    return (
        <Card className="h-[600px] w-full overflow-hidden relative border-0 ring-1 ring-white/10 shadow-2xl bg-slate-950">
            {loading && (
                <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                </div>
            )}

            {/* Dynamic Legend - Same as before */}
            {stats && (() => {
                const isHPI = metric.toLowerCase().includes('house') || metric.toLowerCase().includes('hpi');
                const gradientClass = isHPI
                    ? 'bg-gradient-to-r from-blue-50 via-blue-400 to-blue-900'
                    : 'bg-gradient-to-r from-yellow-100 via-orange-400 to-red-900';

                return (
                    <div className="absolute bottom-6 right-6 z-[500] bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-2xl flex flex-col gap-1 w-48">
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                            <span>Low</span>
                            <span>High</span>
                        </div>
                        <div className={`h-2 w-full rounded-full ${gradientClass}`} />
                    <div className="flex justify-between text-xs text-white font-mono mt-1">
                        <span>{stats.min.toFixed(1)}</span>
                        <span>{stats.p95.toFixed(1)}</span>
                    </div>
                    {stats.p95 < stats.max && (
                        <div className="text-[8px] text-orange-400 text-center mt-0.5">
                            ⚠ Outliers: {stats.max.toFixed(1)}
                        </div>
                    )}
                    <div className="text-[9px] text-slate-500 text-center mt-1 uppercase tracking-widest">{metric}</div>
                    {(stats.usMax !== undefined && stats.caMax !== undefined) && (
                        <div className="text-[7px] text-slate-600 text-center mt-1 border-t border-slate-700 pt-1">
                            US: {stats.usMin?.toFixed(0)}-{stats.usMax?.toFixed(0)} | CA: {stats.caMin?.toFixed(0)}-{stats.caMax?.toFixed(0)}
                        </div>
                    )}
                </div>
                );
            })()}

            <MapContainer
                key={`map-${metric}`}
                center={[48, -95]}
                zoom={3.5}
                maxBounds={[[15, -170], [80, -50]]} // Constrain panning to NA
                minZoom={2.5}
                maxZoom={8}

                // UX & Performance Improvements
                scrollWheelZoom={true} // Keep scrolling working
                wheelDebounceTime={100} // Smoother scroll zoom
                wheelPxPerZoomLevel={60} // Less aggressive zooming on trackpads

                doubleClickZoom={true}
                dragging={true}
                bounceAtZoomLimits={true}

                style={{ height: '100%', width: '100%', background: '#020617' }}
                className="z-0"
                attributionControl={false}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {geoData && (
                    <GeoJSON
                        key={metric}
                        data={geoData}
                        style={style}
                        onEachFeature={onEachFeature}
                    />
                )}
                <MapController />
            </MapContainer>
        </Card>
    );
}
