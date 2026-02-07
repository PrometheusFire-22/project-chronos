import { NextResponse } from 'next/server';
import { db, eq } from '@chronos/database';
import { userUsage } from '@chronos/database';
import { getAuth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch usage from DB
    const usage = await db
      .select()
      .from(userUsage)
      .where(eq(userUsage.userId, userId))
      .limit(1);

    if (!usage || usage.length === 0) {
      // If no usage record exists, return defaults
      return NextResponse.json({
        pdfUploadCount: 0,
        pdfUploadLimit: 3,
        totalPageCount: 0,
        totalPageLimit: 120,
        queryCount: 0,
        queryLimit: 5,
        tier: 'Free'
      });
    }

    return NextResponse.json(usage[0]);
  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
