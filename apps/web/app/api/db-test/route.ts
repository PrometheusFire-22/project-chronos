import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'edge';

export async function GET() {
    try {
        const { env } = await getCloudflareContext({ async: true });

        const diagnostics = {
            hasEnv: !!env,
            envKeys: env ? Object.keys(env) : [],
            hasDB: !!env?.DB,
            dbType: typeof env?.DB,
            dbKeys: env?.DB ? Object.keys(env.DB) : [],
            hasConnectionString: !!env?.DB?.connectionString,
            connectionStringType: typeof env?.DB?.connectionString,
            connectionStringPreview: env?.DB?.connectionString
                ? env.DB.connectionString.substring(0, 30) + '...'
                : null,
        };

        return NextResponse.json({
            success: true,
            diagnostics,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message || String(error),
                stack: error.stack,
            },
            { status: 500 }
        );
    }
}
