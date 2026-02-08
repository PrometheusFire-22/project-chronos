import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { text, timestamp, integer, pgSchema, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const runtime = 'nodejs';

// Inline user_usage schema for Worker bundling compatibility
const authSchema = pgSchema("auth");
const userUsage = authSchema.table('user_usage', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: text('user_id').notNull(),
  pdfUploadCount: integer('pdf_upload_count').default(0),
  pdfUploadLimit: integer('pdf_upload_limit').default(3),
  totalPageCount: integer('total_page_count').default(0),
  maxPagesPerDoc: integer('max_pages_per_doc').default(50),
  totalPageLimit: integer('total_page_limit').default(120),
  queryCount: integer('query_count').default(0),
  queryLimit: integer('query_limit').default(5),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    uniqueUserUsage: uniqueIndex('unique_user_usage').on(table.userId),
  };
});

async function getConnectionConfig(): Promise<{ connectionString: string; isHyperdrive: boolean }> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB?.connectionString) {
      console.log("[UserUsage] Using Hyperdrive connection");
      return { connectionString: ctx.env.DB.connectionString, isHyperdrive: true };
    }
  } catch (e) {
    // Not in Cloudflare Workers environment
  }

  const envUrl = process.env.DATABASE_URL;
  if (envUrl) {
    console.log("[UserUsage] Using DATABASE_URL");
    return { connectionString: envUrl, isHyperdrive: false };
  }

  throw new Error("No database connection available");
}

export async function GET(req: Request) {
  let pool: Pool | undefined;
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Create Hyperdrive-aware connection
    const { connectionString, isHyperdrive } = await getConnectionConfig();

    pool = new Pool({
      connectionString,
      ssl: isHyperdrive ? undefined : { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    const db = drizzle(pool);

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
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
