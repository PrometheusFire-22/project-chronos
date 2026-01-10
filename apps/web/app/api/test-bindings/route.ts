import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'edge';

export async function GET() {
    try {
        const context = await getCloudflareContext({ async: true });

        return NextResponse.json({
            success: true,
            hasContext: !!context,
            hasEnv: !!context.env,
            envKeys: context.env ? Object.keys(context.env) : [],
            hasDB: !!context.env?.DB,
            dbKeys: context.env?.DB ? Object.keys(context.env.DB) : [],
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                stack: error.stack,
            },
            { status: 500 }
        );
    }
}
