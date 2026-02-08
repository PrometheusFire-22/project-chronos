import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { text, timestamp, boolean, integer, pgSchema } from "drizzle-orm/pg-core";

export const runtime = 'nodejs';

// Inline user schema for Worker bundling compatibility
const authSchema = pgSchema("auth");
const userTable = authSchema.table("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  firstName: text("first_name"),
  lastName: text("last_name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  tier: text("tier").default("free"),
  documentsProcessed: integer("documents_processed").default(0),
  queriesThisMonth: integer("queries_this_month").default(0),
  monthlyQueryLimit: integer("monthly_query_limit").default(100),
});

async function getConnectionConfig(): Promise<{ connectionString: string; isHyperdrive: boolean }> {
  // Check for Hyperdrive binding (Cloudflare Workers environment)
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB?.connectionString) {
      console.log("[UserUpdate] Using Hyperdrive connection");
      return { connectionString: ctx.env.DB.connectionString, isHyperdrive: true };
    }
  } catch (e) {
    // Not in Cloudflare Workers environment
  }

  // Fallback to environment variable for local development
  const envUrl = process.env.DATABASE_URL;
  if (envUrl) {
    console.log("[UserUpdate] Using DATABASE_URL");
    return { connectionString: envUrl, isHyperdrive: false };
  }

  throw new Error("No database connection available");
}

export async function POST(req: Request) {
  let pool: Pool | undefined;
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, name } = body;

    // Create Hyperdrive-aware connection
    const { connectionString, isHyperdrive } = await getConnectionConfig();

    pool = new Pool({
      connectionString,
      ssl: isHyperdrive ? undefined : { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    const db = drizzle(pool);

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
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
