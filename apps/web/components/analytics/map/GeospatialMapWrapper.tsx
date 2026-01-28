'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the map to avoid SSR issues with Leaflet
const GeospatialMap = dynamic(
    () => import('./GeospatialMap'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[600px] w-full flex items-center justify-center bg-slate-950 text-slate-500 border border-white/10 rounded-xl">
                Loading Geospatial Engine...
            </div>
        )
    }
);

export default function GeospatialMapWrapper(props: any) {
    return <GeospatialMap {...props} />;
}
