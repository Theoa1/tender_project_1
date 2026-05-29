import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signOwnerSession, setOwnerCookie, verifyAdminCredentials } from '@/lib/auth';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const admin = await verifyAdminCredentials(email, password);
  if (!admin) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
  const token = await signOwnerSession({ sub: admin.id, email: admin.email, role: admin.role });
  await setOwnerCookie(token);
  return NextResponse.json({ ok: true, role: admin.role });
}
