export const runtime = 'nodejs'; // Force Node.js runtime instead of edge

import { auth } from "../../../../lib/auth";

export const GET = auth.handler;
export const POST = auth.handler;
