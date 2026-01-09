import { getPool } from './db/pool';

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

/**
 * Fetches bucketed timeseries data using TimescaleDB's native time_bucket function.
 * Uses a dynamic parameter builder to avoid indexing errors.
 */
export async function getTimeseriesData(filter: AnalyticsFilter): Promise<TimeseriesPoint[]> {
    const { seriesIds, startDate, endDate, geographies, bucketInterval = '1 day' } = filter;

    if (seriesIds.length === 0) return [];

    const params: any[] = [bucketInterval, seriesIds];
    let paramCount = 2;

    let whereClauses = ['eo.series_id = ANY($2)'];

    if (startDate) {
        paramCount++;
        whereClauses.push(`eo.observation_date >= $${paramCount}::date`);
        params.push(startDate);
    }

    if (endDate) {
        paramCount++;
        whereClauses.push(`eo.observation_date <= $${paramCount}::date`);
        params.push(endDate);
    }

    if (geographies && geographies.length > 0) {
        paramCount++;
        whereClauses.push(`sm.geography = ANY($${paramCount})`);
        params.push(geographies);
    }

    const query = `
    SELECT 
      time_bucket($1, eo.observation_date) AS time,
      eo.series_id,
      AVG(eo.value)::float AS value,
      sm.series_name
    FROM timeseries.economic_observations eo
    JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
    WHERE ${whereClauses.join(' AND ')}
    GROUP BY time, eo.series_id, sm.series_name
    ORDER BY time ASC;
  `;

    try {
        const pool = await getPool();
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error: any) {
        console.error('Error fetching timeseries data:', error);
        throw new Error(`Failed to fetch analytics data: ${error.message || String(error)}`);
    }
}

/**
 * Fetches metadata for all active series to populate filters.
 */
export async function getActiveSeries() {
    const query = `
    SELECT series_id, series_name, geography, units, frequency
    FROM metadata.series_metadata
    WHERE is_active = TRUE
    ORDER BY series_name ASC;
  `;

    try {
        const pool = await getPool();
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching series metadata:', error);
        return [];
    }
}

/**
 * Fetches all unique geographies for filtering.
 */
export async function getGeographies() {
    const query = `
    SELECT DISTINCT geography 
    FROM metadata.series_metadata 
    WHERE is_active = TRUE AND geography IS NOT NULL
    ORDER BY geography ASC;
  `;
    try {
        const pool = await getPool();
        const result = await pool.query(query);
        return result.rows.map((r: any) => r.geography);
    } catch (error) {
        console.error('Error fetching geographies:', error);
        return [];
    }
}

/**
 * Fetches related series using Apache AGE (Graph) capabilities.
 */
export async function getRelatedSeries(seriesId: number) {
    try {
        const pool = await getPool();
        await pool.query('SET search_path = "public", "ag_catalog";');
        const query = `
    SELECT * FROM cypher('economic_graph', $$
      MATCH (s:Series {id: $id})-[r:RELATES_TO]->(related:Series)
      RETURN related.id, related.name, r.type
    $$, $params) as (id agtype, name agtype, type agtype);
  `;
        const result = await pool.query(query, [JSON.stringify({ id: seriesId })]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching graph relationships:', error);
        return [];
    }
}
