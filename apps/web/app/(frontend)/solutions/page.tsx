import React from 'react';
import EconomicAnalyticsPage from '../analytics/economic/page';

export const metadata = {
    title: 'Solutions - Multi-Model Intelligence Dashboard',
    description: 'Analyze complex market correlations using native TimescaleDB and Apache AGE intelligence.',
};

export default async function SolutionsPage({ searchParams }: { searchParams: Promise<any> }) {
    // Reusing the EconomicAnalyticsPage component
    return <EconomicAnalyticsPage searchParams={searchParams} />;
}
