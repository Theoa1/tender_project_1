import { NextResponse } from 'next/server';
import { clearClientCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  await clearClientCookie();
  return NextResponse.json({ ok: true });
}
