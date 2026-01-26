import { cache } from 'react';

export interface TimeseriesPoint {
    time: string;
    value: number;
    series_id: number;
    series_name?: string;
}

export interface AnalyticsFilter {
    seriesIds: number[];
    startDate?: string;
    endDate?: string;
    geographies?: string[];
    bucketInterval?: string; // '1 day', '1 week', '1 month'
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.automatonicai.com';
const IS_SERVER = typeof window === 'undefined';

// Helper to determine the correct base URL
function getBaseUrl() {
    // We now use the direct API URL even on the client, as CORS is correctly configured.
    // This avoids issues with Cloudflare Pages rewrites/proxying.
    return API_BASE_URL;
}

/**
 * Fetches bucketed timeseries data from the Python API.
 */
export async function getTimeseriesData(filter: AnalyticsFilter): Promise<TimeseriesPoint[]> {
    const { seriesIds, startDate, endDate, geographies, bucketInterval = '1 day' } = filter;

    if (seriesIds.length === 0) return [];

    const params = new URLSearchParams();
    params.append('series_ids', seriesIds.join(','));
    params.append('interval', bucketInterval);

    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    if (geographies && geographies.length > 0) params.append('geos', geographies.join(','));

    try {
        const baseUrl = getBaseUrl();
        // Use /api/economic/timeseries if direct, or /economic/timeseries if via proxy which rewrites to /api
        // Wait, the proxy rewrites /api-proxy/:path* -> $API_URL/api/:path*
        // So client call: /api-proxy/economic/timeseries -> API/api/economic/timeseries.
        // Server call: API/api/economic/timeseries.

        const path = IS_SERVER ? '/api/economic/timeseries' : '/economic/timeseries';
        const url = `${baseUrl}${path}?${params.toString()}`;

        const res = await fetch(url, {
             next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data;

    } catch (error: any) {
        console.error('Error fetching timeseries data:', error);
        throw new Error(`Failed to fetch analytics data: ${error.message || String(error)}`);
    }
}

/**
 * Fetches metadata for all active series to populate filters.
 */
export async function getActiveSeries() {
    try {
        const baseUrl = getBaseUrl();
        const path = IS_SERVER ? '/api/economic/series' : '/economic/series';
        const url = `${baseUrl}${path}`;

        const res = await fetch(url, {
             next: { revalidate: 86400 } // Cache for 24 hours
        });

        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        return await res.json();
    } catch (error) {
        console.error('Error fetching series metadata:', error);
        return [];
    }
}

/**
 * Fetches all unique geographies for filtering.
 */
export async function getGeographies() {
    try {
        const baseUrl = getBaseUrl();
        const path = IS_SERVER ? '/api/economic/geographies' : '/economic/geographies';
        const url = `${baseUrl}${path}`;

        const res = await fetch(url, {
             next: { revalidate: 86400 }
        });

        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        return await res.json();
    } catch (error) {
        console.error('Error fetching geographies:', error);
        return [];
    }
}

/**
 * Fetches related series using Apache AGE (Graph) capabilities.
 * NOTE: This is not yet fully implemented in the Python API, so we return empty for now
 * or we could add an endpoint for it.
 */
export async function getRelatedSeries(seriesId: number) {
    // TODO: Implement /api/graph/related endpoint
    console.warn("Graph API not yet implemented in Python service");
    return [];
}
