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

// R2 avatars bucket public URL (chronos-avatars)
const AVATARS_PUBLIC_URL = process.env.AVATARS_PUBLIC_URL || 'https://pub-4dde77d064a9487fa0fd95dc8b2c2935.r2.dev';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function getAvatarsBucket(): Promise<any> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.AVATARS) {
      return ctx.env.AVATARS;
    }
  } catch {
    // Not in Cloudflare context
  }
  return null;
}

async function getConnectionConfig(): Promise<{ connectionString: string; isHyperdrive: boolean }> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB?.connectionString) {
      return { connectionString: ctx.env.DB.connectionString, isHyperdrive: true };
    }
  } catch {
    // Not in Cloudflare Workers environment
  }

  const envUrl = process.env.DATABASE_URL;
  if (envUrl) {
    return { connectionString: envUrl, isHyperdrive: false };
  }

  throw new Error("No database connection available");
}

export async function POST(req: Request) {
  let pool: Pool | undefined;

  try {
    // Authenticate user
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get R2 avatars bucket
    const bucket = await getAvatarsBucket();
    if (!bucket) {
      console.error('[Avatar] R2 avatars bucket not available');
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB'
      }, { status: 400 });
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Generate R2 key: avatars/{userId}/avatar.{ext}
    // Use original extension for now - could convert to WebP in future
    const ext = file.type.split('/')[1] || 'jpg';
    const r2Key = `avatars/${userId}/avatar.${ext}`;

    // Upload to R2
    await bucket.put(r2Key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });

    console.log(`[Avatar] Uploaded to R2: ${r2Key}`);

    // Construct public URL
    const publicUrl = `${AVATARS_PUBLIC_URL}/${r2Key}`;

    // Update user.image in database
    const { connectionString, isHyperdrive } = await getConnectionConfig();

    pool = new Pool({
      connectionString,
      ssl: isHyperdrive ? undefined : { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    const db = drizzle(pool);

    await db
      .update(userTable)
      .set({
        image: publicUrl,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId));

    console.log(`[Avatar] Updated user.image for ${userId}`);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl
    });

  } catch (error) {
    console.error('[Avatar] Error:', error);
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// DELETE endpoint to remove avatar
export async function DELETE(req: Request) {
  let pool: Pool | undefined;

  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get R2 avatars bucket and delete all avatar files for user
    const bucket = await getAvatarsBucket();
    if (bucket) {
      // List and delete any existing avatars
      const list = await bucket.list({ prefix: `avatars/${userId}/` });
      for (const obj of list.objects) {
        await bucket.delete(obj.key);
      }
      console.log(`[Avatar] Deleted R2 files for ${userId}`);
    }

    // Clear user.image in database
    const { connectionString, isHyperdrive } = await getConnectionConfig();

    pool = new Pool({
      connectionString,
      ssl: isHyperdrive ? undefined : { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    const db = drizzle(pool);

    await db
      .update(userTable)
      .set({
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Avatar] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete avatar' }, { status: 500 });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
