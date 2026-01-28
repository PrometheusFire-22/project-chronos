'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the map to avoid SSR issues with MapLibre GL
const GeospatialMapLibre = dynamic(
    () => import('./GeospatialMapLibre'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[600px] w-full flex items-center justify-center bg-slate-950 text-slate-500 border border-white/10 rounded-xl">
                <div className="animate-pulse">Loading MapLibre GL...</div>
            </div>
        )
    }
);

export default function GeospatialMapWrapper(props: any) {
    return <GeospatialMapLibre {...props} />;
}
