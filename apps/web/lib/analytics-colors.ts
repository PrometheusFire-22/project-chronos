export const DASHBOARD_COLORS = ['#34d399', '#fbbf24', '#a78bfa', '#2dd4bf', '#f472b6'];
export const US_BLUE = '#60a5fa';
export const CANADA_RED = '#f87171';

export interface SeriesMetadata {
    series_id: number;
    series_name: string;
    geography: string;
}

export function assignSeriesColors(series: SeriesMetadata[]): Record<number, string> {
    const assignments: Record<number, string> = {};
    const usedColors = new Set<string>();

    // Use a stable sort to ensure colors don't jump around on re-renders
    const sortedSeries = [...series].sort((a, b) => a.series_id - b.series_id);

    sortedSeries.forEach((meta) => {
        let color = '';
        const geo = (meta.geography || "").toUpperCase();

        if (geo === 'CANADA' || geo === 'CA') {
            if (!usedColors.has(CANADA_RED)) {
                color = CANADA_RED;
            }
        } else if (geo.includes('UNITED STATES') || geo === 'US') {
            if (!usedColors.has(US_BLUE)) {
                color = US_BLUE;
            }
        }

        if (!color) {
            color = DASHBOARD_COLORS.find(c => !usedColors.has(c)) || DASHBOARD_COLORS[0];
        }

        usedColors.add(color);
        assignments[meta.series_id] = color;
    });

    return assignments;
}
