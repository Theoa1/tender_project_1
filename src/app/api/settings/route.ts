import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getOwnerSession } from '@/lib/auth';
import { ensureSeed, getOwnerNotifyEmail, setSetting, SETTING_KEYS } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureSeed();
  const notifyEmail = await getOwnerNotifyEmail();
  return NextResponse.json({ notifyEmail });
}

const schema = z.object({
  notifyEmail: z.string().email(),
});

export async function PUT(req: NextRequest) {
  const session = await getOwnerSession();
  if (!session || (session.role !== 'owner' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  await setSetting(SETTING_KEYS.ownerNotifyEmail, parsed.data.notifyEmail.toLowerCase().trim());
  return NextResponse.json({ ok: true });
}
