import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    return await auth.handler(request);
  } catch (error: any) {
    console.error('[Auth GET Error]:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause
    });
    return NextResponse.json(
      {
        error: 'Auth handler failed',
        details: error?.message,
        type: error?.name
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    return await auth.handler(request);
  } catch (error: any) {
    console.error('[Auth POST Error]:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause
    });
    return NextResponse.json(
      {
        error: 'Auth handler failed',
        details: error?.message,
        type: error?.name
      },
      { status: 500 }
    );
  }
}
