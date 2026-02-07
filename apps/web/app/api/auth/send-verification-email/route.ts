import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * API endpoint to resend verification email
 * POST /api/auth/send-verification-email
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const auth = await getAuth();
    await auth.api.sendVerificationEmail({
      body: { email },
      headers: request.headers
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send verification email',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
