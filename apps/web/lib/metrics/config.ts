/**
 * Metric Configuration Registry
 *
 * Centralized configuration for all geospatial metrics.
 * Add new metrics here - no code changes needed elsewhere!
 */

export interface MetricConfig {
  /** Unique key matching database metric_type */
  key: string;
  /** Human-readable display name */
  displayName: string;
  /** Data update frequency */
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  /** Whether values should be formatted as percentages */
  isPercentage: boolean;
  /** Number of decimal places to display */
  decimals: number;
  /** Optional description for tooltips/docs */
  description?: string;
}

/**
 * Metric Registry
 * Add new metrics here to make them work automatically across the app
 */
export const METRIC_REGISTRY: Record<string, MetricConfig> = {
  unemployment: {
    key: 'unemployment',
    displayName: 'Unemployment Rate',
    frequency: 'MONTHLY',
    isPercentage: true,
    decimals: 2,
    description: 'Percentage of labor force that is unemployed',
  },
  hpi: {
    key: 'hpi',
    displayName: 'House Price Index',
    frequency: 'QUARTERLY',
    isPercentage: false,
    decimals: 2,
    description: 'Index of residential property prices',
  },
  // Add future metrics here following the same pattern
  // gdp: { key: 'gdp', displayName: 'GDP', frequency: 'QUARTERLY', isPercentage: false, decimals: 2 },
  // cpi: { key: 'cpi', displayName: 'Consumer Price Index', frequency: 'MONTHLY', isPercentage: false, decimals: 2 },
};

/**
 * Get metric configuration with intelligent fallback
 * @param key - Metric key from database
 * @returns Metric configuration
 */
export function getMetricConfig(key: string): MetricConfig {
  const normalized = (key || "").toLowerCase().trim();

  // Return registered metric if found
  if (!normalized || METRIC_REGISTRY[normalized]) {
    return METRIC_REGISTRY[normalized] || METRIC_REGISTRY.unemployment;
  }

  // Intelligent fallback for unknown metrics
  return {
    key: normalized,
    displayName: normalized.toUpperCase().replace(/_/g, ' '),
    frequency: 'MONTHLY',
    isPercentage: normalized.includes('rate') || normalized.includes('percent'),
    decimals: 2,
    description: `Auto-detected metric: ${normalized}`,
  };
}

/**
 * Format a metric value according to its configuration
 * @param value - Raw numeric value
 * @param config - Metric configuration
 * @returns Formatted string
 */
export function formatMetricValue(value: number | string | null | undefined, config: MetricConfig): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  const numVal = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numVal)) {
    return 'N/A';
  }

  const formatted = numVal.toFixed(config.decimals);
  return config.isPercentage ? `${formatted}%` : formatted;
}
