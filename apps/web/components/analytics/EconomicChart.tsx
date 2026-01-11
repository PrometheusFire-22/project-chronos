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
                max,
                color: assignments[meta.series_id]
            };
        });

        const sortedByMax = [...config].sort((a, b) => b.max - a.max);

        // SCALE AWARENESS: Lowered to 3x for high sensitivity
        // Only use dual axis if the scales are vastly different
        const useDual = config.length > 1 && sortedByMax[0].max / (sortedByMax[sortedByMax.length - 1].max || 1) > 3;

        if (!useDual) {
            return config.map(c => ({ ...c, yAxisId: 'left' }));
        }

        const bigMax = sortedByMax[0].max;
        // Map to right axis if it's less than 33% of the dominant series scale
        return config.map(c => ({
            ...c,
            yAxisId: c.max < (bigMax * 0.33) ? 'right' : 'left'
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
                            return [
                                typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : value,
                                displayName
                            ];
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
