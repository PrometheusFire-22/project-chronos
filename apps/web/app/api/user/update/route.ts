import { NextResponse } from 'next/server';
import { db, eq } from '@chronos/database';
import { user as userTable } from '@chronos/database';
import { getAuth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, name } = body;

    // Update user in database
    await db
      .update(userTable)
      .set({
        firstName,
        lastName,
        name,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
