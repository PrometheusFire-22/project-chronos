import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

export async function GET() {
  try {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      return NextResponse.json({
        error: 'DATABASE_URL not set',
        env: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('AUTH'))
      }, { status: 500 });
    }

    const pool = new Pool({ connectionString });

    const result = await pool.query('SELECT current_database(), current_schema(), COUNT(*) as user_count FROM auth.user');

    await pool.end();

    return NextResponse.json({
      success: true,
      database: result.rows[0].current_database,
      schema: result.rows[0].current_schema,
      users: result.rows[0].user_count,
      connectionString: connectionString.replace(/:[^:@]+@/, ':****@') // hide password
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      code: error.code
    }, { status: 500 });
  }
}
