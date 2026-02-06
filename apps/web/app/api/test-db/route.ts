import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      return NextResponse.json({
        error: 'DATABASE_URL not set',
        env: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('AUTH'))
      }, { status: 500 });
    }

    // Use neon HTTP driver - works over HTTPS, not WebSockets
    const sql = neon(connectionString);

    const result = await sql`SELECT current_database() as db, current_schema() as schema, COUNT(*) as user_count FROM auth.user`;

    return NextResponse.json({
      success: true,
      database: result[0].db,
      schema: result[0].schema,
      users: result[0].user_count,
      driver: 'neon-http',
      connectionString: connectionString.replace(/:[^:@]+@/, ':****@') // hide password
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5),
      code: error.code,
      driver: 'neon-http'
    }, { status: 500 });
  }
}
