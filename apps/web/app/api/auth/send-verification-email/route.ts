import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

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

    // Use Better Auth's built-in sendVerificationEmail method
    // Pass headers for proper context
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
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
