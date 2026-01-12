// apps/web/components/analytics/MapLegend.tsx
// Legend component for displaying choropleth color scale

'use client';

interface MapLegendProps {
  title: string;
  min: number;
  max: number;
  units?: string;
  colorScale?: string[];
}

export default function MapLegend({
  title,
  min,
  max,
  units = '',
  colorScale = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
}: MapLegendProps) {
  const formatValue = (value: number): string => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(1);
  };

  // Create legend segments
  const segments = colorScale.length;
  const range = max - min;
  const step = range / segments;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {title}
      </h3>

      {/* Color Scale */}
      <div className="space-y-2">
        <div className="flex h-6 rounded overflow-hidden">
          {colorScale.map((color, index) => (
            <div
              key={index}
              style={{
                backgroundColor: color,
                width: `${100 / colorScale.length}%`,
              }}
            />
          ))}
        </div>

        {/* Value Labels */}
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>
            {formatValue(min)}
            {units && ` ${units}`}
          </span>
          <span>
            {formatValue(max)}
            {units && ` ${units}`}
          </span>
        </div>
      </div>

      {/* Data Unavailable Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500" />
          <span>No data available</span>
        </div>
      </div>
    </div>
  );
}
