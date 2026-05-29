import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { consumeCode, normalizeEmail } from '@/lib/verify';
import { signClientSession, setClientCookie } from '@/lib/auth';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const email = normalizeEmail(parsed.data.email);
  const ok = await consumeCode('email', email, 'login', parsed.data.code);
  if (!ok) {
    return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 401 });
  }
  const token = await signClientSession(email);
  await setClientCookie(token);
  return NextResponse.json({ ok: true });
}
