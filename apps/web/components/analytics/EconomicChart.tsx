"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

import { assignSeriesColors } from '@/lib/analytics-colors';

interface SeriesMeta {
    series_id: number;
    series_name: string;
    geography: string;
}

interface DataPoint {
    time: string;
    [key: string]: any;
}

interface EconomicChartProps {
    data: DataPoint[];
    seriesMetadata: SeriesMeta[];
}

export default function EconomicChart({ data, seriesMetadata }: EconomicChartProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const seriesConfig = useMemo(() => {
        if (data.length === 0 || seriesMetadata.length === 0) return [];

        const assignments = assignSeriesColors(seriesMetadata);

        const config = seriesMetadata.map((meta) => {
            const key = `s_${meta.series_id}`;
            const values = data.map(d => d[key]).filter(v => typeof v === 'number');
            const max = values.length > 0 ? Math.max(...values) : 0;

            return {
                ...meta,
                key,
                max: max || 0.1, // Prevent division by zero
                color: assignments[meta.series_id]
            };
        });

        // 1. Sort by max value (descending)
        const sorted = [...config].sort((a, b) => b.max - a.max);

        // 2. If only 1 series, or very similar scales (max/min < 3x), use single axis
        const globalMax = sorted[0].max;
        const globalMin = sorted[sorted.length - 1].max;

        if (sorted.length < 2 || (globalMax / globalMin) < 3) {
             return config.map(c => ({ ...c, yAxisId: 'left' }));
        }

        // 3. Smart Split Algorithm: Find the split point that minimizes "scale crushing"
        // We test splitting the sorted array at every index.
        // Group A (Left) = [0...i], Group B (Right) = [i+1...n]
        // Score = (MaxA/MinA) + (MaxB/MinB). Lower is better.
        let bestSplitIndex = 0;
        let bestScore = Infinity;

        for (let i = 0; i < sorted.length - 1; i++) {
            const groupA = sorted.slice(0, i + 1);
            const groupB = sorted.slice(i + 1);

            const maxA = groupA[0].max;
            const minA = groupA[groupA.length - 1].max;
            const ratioA = maxA / minA;

            const maxB = groupB[0].max;
            const minB = groupB[groupB.length - 1].max;
            const ratioB = maxB / minB;

            const score = ratioA + ratioB;

            if (score < bestScore) {
                bestScore = score;
                bestSplitIndex = i;
            }
        }

        // 4. Assign axes based on the best split
        // The "larger" values (Group A) go to Left, "smaller" (Group B) to Right
        // But if the "Right" group is still wildly disparate, we might lose the smallest one,
        // but this is the mathematically optimal 2-axis split.
        const leftKeys = new Set(sorted.slice(0, bestSplitIndex + 1).map(s => s.key));

        return config.map(c => ({
            ...c,
            yAxisId: leftKeys.has(c.key) ? 'left' : 'right'
        }));
    }, [data, seriesMetadata]);

    const leftAxisColor = useMemo(() => {
        const leftSeries = seriesConfig.filter(s => s.yAxisId === 'left');
        return leftSeries.length > 0 ? leftSeries[0].color : '#94a3b8';
    }, [seriesConfig]);

    const rightAxisColor = useMemo(() => {
        const rightSeries = seriesConfig.filter(s => s.yAxisId === 'right');
        return rightSeries.length > 0 ? rightSeries[0].color : '#f87171';
    }, [seriesConfig]);

    if (!isMounted) {
        return <div className="w-full h-[500px] md:h-[550px] bg-slate-100 dark:bg-slate-900/50 animate-pulse rounded-2xl" />;
    }

    return (
        <div className="w-full h-[500px] md:h-[550px] p-4 md:p-6 bg-white dark:bg-slate-950 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.05} />

                    <XAxis
                        dataKey="time"
                        tickFormatter={(value) => new Date(value).getFullYear().toString()}
                        minTickGap={60}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                    />

                    <YAxis
                        yAxisId="left"
                        stroke={leftAxisColor}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value > 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                        width={40}
                    />

                    {seriesConfig.some(s => s.yAxisId === 'right') && (
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke={rightAxisColor}
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value > 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(1)}
                            width={40}
                        />
                    )}

                    <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        formatter={(value, name, props) => {
                            // Find the metadata using the s_{id} key from name (passed as dataKey)
                            const config = seriesConfig.find(s => s.key === props.dataKey);
                            const displayName = config ? `${config.series_name} (${config.geography})` : name;

                            let formattedValue = value;
                            if (typeof value === 'number') {
                                if (value === 0) formattedValue = "0";
                                else if (Math.abs(value) < 0.01) formattedValue = value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
                                else if (Math.abs(value) < 1) formattedValue = value.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 4 });
                                else formattedValue = value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
                            }

                            return [formattedValue, displayName];
                        }}
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            borderRadius: '16px',
                            border: '1px solid rgba(51, 65, 85, 0.8)',
                            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                            color: '#f8fafc'
                        }}
                        itemStyle={{ fontSize: '12px', padding: '2px 0' }}
                    />

                    <Legend
                        verticalAlign="bottom"
                        height={60}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                        formatter={(value, entry: any) => {
                            // entry.dataKey contains s_{id}
                            const config = seriesConfig.find(s => s.key === entry.dataKey);
                            return <span className="text-xs md:text-sm font-semibold" style={{ color: config?.color || '#94a3b8' }}>{config?.series_name || value}</span>
                        }}
                    />

                    {seriesConfig.map((config) => (
                        <Line
                            key={config.key}
                            yAxisId={config.yAxisId}
                            type="monotone"
                            dataKey={config.key}
                            name={config.key} // Keep key as name for internal lookup in formatter
                            stroke={config.color || '#94a3b8'}
                            strokeWidth={3}
                            dot={false}
                            connectNulls={true}
                            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                            animationDuration={1500}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
